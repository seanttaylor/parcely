const uuid = require('uuid');
const QRCode = require('qrcode');
const coreUtils = require('../lib/utils');
const { CrateDTO } = require('../lib/repository/crate/dto');
const { CrateShipmentDTO, CrateTelemetryDTO } = require('../lib/repository/crate-shipment/dto');

/**
* @typedef {Object} Crate
* @property {String} id - the uuid of the user
* @property {Object} _data - the user data
* @property {Object} _repo - the repository instance associated with this entity
*/

/**
 *
 * @param {Object} repo - the repo associated with this entity
 * @param {CrateDTO} crateDTO - an instance of the CrateDTO
 * @param {EventEmitter} eventEmitter - an instance of EventEmitter
 * @param {UserService} userService - an instance of UserService
 */

function Crate({
  repo, crateDTO, eventEmitter, userService,
}) {
  const dtoData = crateDTO.value();

  this._data = dtoData;
  this._repo = repo;
  this.id = dtoData.id;

  this.toJSON = function () {
    return {
      id: this.id,
      createdDate: this._data.createdDate,
      lastModified: this._data.lastModified,
      data: {
        id: this.id,
        size: this._data.size,
        shipmentId: this._data.shipmentId,
        merchantId: this._data.merchantId,
        recipientId: this._data.recipientId,
        recipientEmail: this._data.recipientEmail,
        telemetry: this._data.telemetry,
        adaloDigestTelemetry: {
          temp: String(this._data.telemetry.temp.degreesFahrenheit),
          lat: String(this._data.telemetry.location.coords.lat),
          lng: String(this._data.telemetry.location.coords.lng),
          zip: String(this._data.telemetry.location.zip),
          moistureThresholdExceeded: String(this._data.telemetry.sensors.moisture.thresholdExceeded),
          photometerThresholdExceeded: String(this._data.telemetry.sensors.photometer.thresholdExceeded),
          thermometerThresholdExceeded: String(this._data.telemetry.sensors.thermometer.thresholdExceeded),
        },
        lastPing: this._data.lastPing,
        status: this._data.status,
      },
    };
  };

  /**
    Saves a new crate to the data store
    @returns {String} - a uuid for the new user
    */
  this.save = async function () {
    const crateDTO = new CrateDTO(this._data);
    const crate = await this._repo.crate.create(crateDTO);
    eventEmitter.emit('Crate.StorageBucketService.NewCrate', crate.id);
    return crate.id;
  };

  /**
    Associates the crate with a recipient user in the data store
    @param {String} recipientEmail - an email address for the recipient user
    */
  this.setRecipient = async function (recipientEmail) {
    if (this._data.recipientEmail) {
      throw new Error('CrateError.CannotSetRecipient => Recipient has already been assigned for this crate');
    }

    try {
      const [user] = await userService.findUserByEmail(recipientEmail);
      const crateDTO = new CrateDTO(Object.assign(this._data, {
        recipientId: user.id,
        recipientEmail: user._data.emailAddress,
      }));
      await this._repo.crate.setCrateRecipient(crateDTO);
      this._data.recipientId = user.id;
      this._data.recipientEmail = user._data.emailAddress;
    } catch (e) {
      // If the user isn't registered, we only associate the crate with an email address
      // console.error('CrateError.CannotSetRecipient.BadRequest.UserDoesNotExist => Could not find the specified user in the database');
      // console.info('CrateInfo.SetRecipient.Fallback => Associating crate with recipient email address only');

      const crateDTO = new CrateDTO(Object.assign(this._data, {
        recipientId: null,
        recipientEmail,
      }));
      await this._repo.crate.setCrateRecipient(crateDTO);
      this._data.recipientId = null;
      this._data.recipientEmail = recipientEmail;
    }
  };

  /**
    Pushes telemetry data from the physical crate sensors to the data store
    @param {Object} telemetry - data from the sensors
    */
  this.pushTelemetry = async function (telemetry) {
    const [currentShipmentStatus] = this.currentTrip._data.status;

    if (currentShipmentStatus === 'complete') {
      return undefined;
    }

    const timestamp = new Date().toISOString();
    const crateDTO = new CrateDTO(Object.assign(this._data, {
      telemetry,
      lastPing: timestamp,
    }));

    await this._repo.crate.updateCrateTelemetry(crateDTO);
    await this.currentTrip.addWaypoint({ timestamp, telemetry });
    this._data.telemetry = telemetry;

    return { telemetry, timestamp, crateId: this.id };
  };

  /**
    Returns the most recent crate telemetry data (i.e. a snapshot)
    @param {Object} telemetry - data from the sensors
    */
  this.getCurrentTelemetry = async function () {
    const { telemetry } = await this._repo.crate.getCrateById(this.id);
    return telemetry;
  };

  /**
    Initializes a new shipment for the current crate
    @param {Object} originAddress - the postal address a crate originates from
    @param {Object} destinationAddress - the postal address a crate ships to
    @param {String} trackingNumber - shipping carrier tracking number associated with this crate for this shipment
    */
  this.startShipment = async function ({ originAddress, destinationAddress, trackingNumber }) {
    if (!this._data.merchantId) {
      throw new Error('CrateError.CannotStartShipment.missingMerchantId => Cannot start crate shipment without merchantId assigned to associated crate');
    }

    if (!this._data.recipientEmail) {
      throw new Error('CrateError.CannotStartShipment.missingRecipient => Cannot start crate shipment without recipient assigned to associated crate');
    }

    const id = uuid.v4();
    const status = ['inTransit'];
    const crateShipmentDTO = new CrateShipmentDTO({
      id,
      crateId: this._data.id,
      recipientId: this._data.recipientId,
      recipientEmail: this._data.recipientEmail,
      merchantId: this._data.merchantId,
      originAddress,
      destinationAddress,
      trackingNumber,
      arrivalZip: destinationAddress.zip,
      departureZip: originAddress.zip,
      departureTimestamp: new Date().toISOString(),
    });

    const crateShipment = new CrateShipment(this._repo.crateShipment, crateShipmentDTO);
    crateShipment._data.crateId = this._data.id;

    await crateShipment.save();
    await this._repo.crate.startCrateShipment(new CrateDTO(Object.assign(this._data, {
      status,
      shipmentId: id,
    })));

    this._data.status = status;
    this._data.shipmentId = id;
    this.currentTrip = crateShipment;
    return crateShipment.id;
  };

  /**
    Completes an existing shipment for the current crate; crate shipment data becomes read-only
    */
  this.completeShipment = async function () {
    const shipmentStatus = ['complete'];
    const crateStatus = ['delivered'];
    const arrivalTimestamp = new Date().toISOString();
    const crateDTO = new CrateDTO({
      ...this._data,
      shipmentId: null,
      recipientId: null,
      recipientEmail: null,
      status: crateStatus,
    });
    const crateShipmentDTO = new CrateShipmentDTO(
      ({
        ...this.currentTrip._data,
        status: shipmentStatus,
        crateId: this._data.id,
        arrivalTimestamp,
      }),
    );

    await this._repo.crate.setCrateRecipient(crateDTO);
    await this._repo.crateShipment.completeCrateShipment(crateShipmentDTO);
    this.currentTrip._data.status = shipmentStatus;
    this._data.recipientId = null;
    this._data.recipientEmail = null;
    this._data.shipmentId = null;
    this._data.status = crateStatus;
  };
}

/**
* @typedef {Object} CrateShipment
* @property {String} id - the uuid of the CrateShipment
* @property {Object} _data - the CrateShipment data
* @property {Object} _repo - the repository instance associated with this shipment
*/

/**
 *
 * @param {Object} repo - the repo associated with this crateShipment
 * @param {CrateShipmentDTO} crateShipmentDTO - an instance of the CrateShipmentDTO
 */

function CrateShipment(repo, crateShipmentDTO) {
  const dtoData = crateShipmentDTO.value();

  this._data = dtoData;
  this._repo = repo;
  this.id = dtoData.id;
  this.waypoints = dtoData.waypoints;

  this.toJSON = function () {
    const lastWaypoint = this._data.waypoints[this._data.waypoints.length - 1];

    return {
      id: this.id,
      createdDate: this._data.createdDate,
      lastModified: this._data.lastModified,
      data: {
        id: this.id,
        crateId: this._data.crateId,
        merchantId: this._data.merchantId,
        recipientId: this._data.recipientId,
        recipientEmail: this._data.recipientEmail,
        departureTimestamp: this._data.departureTimestamp,
        departureZip: this._data.departureZip,
        arrivalTimestamp: this._data.arrivalTimestamp,
        arrivalZip: this._data.arrivalZip,
        trackingNumber: this._data.trackingNumber,
        originAddress: this._data.originAddress,
        destinationAddress: this._data.destinationAddress,
        status: this._data.status,
        adaloDigestTelemetry: new VendorDigestTelemetry(lastWaypoint),
        waypoints: this._data.waypoints,
        waypointsIncluded: this._data.waypointsIncluded,
      },
    };
  };

  /**
     * Saves a new CrateShipment to the data store
     * @returns {String} - a uuid for the new user
     */
  this.save = async function () {
    const crateShipmentDTO = new CrateShipmentDTO(this._data);
    const crateShipment = await this._repo.create(crateShipmentDTO);
    return crateShipment.id;
  };

  /**
     * Adds a new waypoint to an in progress shipment
     * @param {String} timestamp - date/time telemetry data was recorded
     * @param {Object} telemetry - sensor data collected from the hardware crate
     */
  this.addWaypoint = async function ({ telemetry }) {
    const [currentShipmentStatus] = this._data.status;
    const timestamp = new Date().toISOString();

    if (currentShipmentStatus === 'complete') {
      return;
    }

    const crateTelemetryDTO = new CrateTelemetryDTO({ timestamp, telemetry });
    const crateTelemetry = crateTelemetryDTO.value();
    this._data.waypoints.push(crateTelemetry);
    // freeze all telemetry objects in the waypoints list
    this._data.waypoints = this._data.waypoints.map(coreUtils.deepFreeze);

    const crateShipmentDTO = new CrateShipmentDTO({ ...this._data });

    await this._repo.addTripWaypoint(crateShipmentDTO);
    // copy the internal waypoints list to an public read-only property
    this.waypoints = coreUtils.deepFreeze([...this._data.waypoints]);
  };
}

/**
 * @typedef {Object} CrateService
 * @property {Object} _repo - the repository associated with this service
 */

/**
 * @param {Object} crateRepo - the crates repository
 * @param {Object} crateShipmentRepo - the crate_shipments repository
 * @param {QueueService} queueService - an instance of QueueService
 * @param {StorageBucketService} storageBucketService - an instance of StorageBucketService
 * @param {UserService} userService - an instance of UserService
 * @param {EventEmitter} eventEmitter - an instance of EventEmitter
 */
function CrateService({
  crateRepo,
  crateShipmentRepo,
  queueService,
  storageBucketService,
  userService,
  eventEmitter,
}) {
  this._repo = {
    crate: crateRepo,
    crateShipment: crateShipmentRepo,
  };

  eventEmitter.on('CrateAPI.QueueService.TelemetryUpdateReceived', async () => {
    const messageList = await queueService.dequeue();

    messageList.map(async ({ crateId, telemetry }) => {
      const crate = await this.getCrateById(crateId);
      const telemetryUpdate = await crate.pushTelemetry(telemetry);
      eventEmitter.emit('SSEPublisher.TelemetryUpdateReceived', telemetryUpdate);
    });
  });

  eventEmitter.on('Crate.StorageBucketService.NewCrate', async (crateId) => {
    const dataURI = await QRCode.toDataURL(crateId);
    const QRCodeImage = Buffer.from(dataURI.split(',')[1], 'base64');

    await storageBucketService.putBucket({
      bucketName: 'crate-qr-codes',
      itemName: `${crateId}.png`,
      item: QRCodeImage,
    });
  });

  storageBucketService.create('crate-qr-codes');

  /**
     * @param {Object} doc - object representing valid crate data
     */
  this.createCrate = function (doc) {
    const id = uuid.v4();
    const data = { id, ...doc };

    return new Crate({
      repo: this._repo,
      crateDTO: new CrateDTO(data),
      eventEmitter,
      userService,
    });
  };

  /**
     * @param {String} id - a uuid for a crate
     */
  this.getCrateById = async function (id) {
    const crateData = await this._repo.crate.getCrateById(id);

    if (!crateData) {
      return undefined;
    }

    const crate = new Crate({
      repo: this._repo,
      crateDTO: new CrateDTO(crateData),
      eventEmitter,
      userService,
    });
    const { shipmentId } = crate._data;

    if (shipmentId) {
      const crateShipmentData = await this._repo.crateShipment.getCrateShipmentById(shipmentId);

      const crateShipment = new CrateShipment(this._repo.crateShipment, new CrateShipmentDTO(crateShipmentData));

      crate.currentTrip = crateShipment;
    }

    return crate;
  };

  this.getAllCrates = async function () {
    const crates = await this._repo.crate.getAllCrates();
    return crates.map((c) => new Crate({
      repo: this._repo.crate,
      crateDTO: new CrateDTO(c),
      eventEmitter,
      userService,
    }));
  };

  /**
     * @param {User} user - an instance of a User
     */
  this.getCratesByRecipient = async function (user) {
    const crateList = await this._repo.crate.getCratesByRecipientId(user.id);
    return crateList.map((c) => new Crate({
      repo: this._repo.crate,
      crateDTO: new CrateDTO(c),
      eventEmitter,
      userService,
    }));
  };

  /**
     * @param {String} shipmentId - a uuid of a CrateShipment
     * @param {Object} options - a configuration object
     */
  this.getCrateShipmentById = async function (shipmentId, { includeWaypoints = false } = {}) {
    const shipmentData = await this._repo.crateShipment.getCrateShipmentById(shipmentId);
    console.log(`SHIPMENT_DATA: ${JSON.stringify(shipmentData)}`);
    const shipment = new CrateShipment(this._repo.crateShipment, new CrateShipmentDTO(shipmentData));

    shipment._data.waypointsIncluded = includeWaypoints;

    if (!includeWaypoints) {
      shipment._data.waypoints = [];
    }

    return shipment;
  };

  /**
     * @param {Crate} crate - an instance of a Crate
     * @param {Object} options - a configuration object
     */
  this.getShipmentsByCrate = async function (crate, { includeWaypoints = false } = {}) {
    const crateShipmentList = await this._repo.crateShipment.getCrateShipmentsByCrateId(crate.id);

    return crateShipmentList.map((shipmentData) => {
      const shipment = new CrateShipment(this._repo.crateShipment, new CrateShipmentDTO(shipmentData));
      shipment._data.waypointsIncluded = includeWaypoints;

      if (!includeWaypoints) {
        shipment._data.waypoints = [];
      }

      return shipment;
    });
  };

  /**
     * @param {String} merchantId - a uuid for merchant
     * @param {Boolean} asDigest - indicates whether the waypoint data should be returned in digest format
     */
  this.getShipmentsByMerchantId = async function ({ merchantId, asDigest = false }) {
    const crateShipmentList = await this._repo.crateShipment.getAllCrateShipments();

    const merchantShipmentList = crateShipmentList.filter((s) => s.merchantId === merchantId)
      .map((shipmentData) => {
        const shipment = new CrateShipment(this._repo.crateShipment, new CrateShipmentDTO(shipmentData));
        shipment._data.waypointsIncluded = true;

        return shipment;
      });

    if (!asDigest) {
      return merchantShipmentList;
    }

    merchantShipmentList.forEach((shipment) => {
      const digestWaypoints = shipment.waypoints.map((wp) => new VendorDigestTelemetry(wp));
      Object.assign(shipment, { waypoints: digestWaypoints });
    });

    return merchantShipmentList;
  };

  /**
     * @param {String} id - a uuid of a merchant
     */
  this.getCratesByMerchantId = async function (id) {
    const crateList = await this._repo.crate.getCratesByMerchantId(id);

    return crateList.map((crateData) => new Crate({
      repo: this._repo,
      crateDTO: new CrateDTO(crateData),
      eventEmitter,
      userService,
    }));
  };

  /**
     * @param {User} user - an instance of a User
     * @param {Object} options - an options object
     */
  this.getShipmentHistoryOf = async function (user, { filterBy }) {
    const crateShipmentList = await this._repo.crateShipment.getCrateShipmentsByRecipientId(user.id);

    return crateShipmentList.filter((s) => {
      if (filterBy) {
        return s.status[0] === filterBy;
      }
      return true;
    })
      .map((s) => {
        const shipment = new CrateShipment(this._repo.crateShipment, new CrateShipmentDTO(s));

        shipment._data.waypointsIncluded = false;
        shipment._data.waypoints = [];
        return shipment;
      });
  };

  /**
     * @param {String} id - a uuid for a crate
     */
  this.deleteCrate = async function (id) {
    await this._repo.crate.deleteCrate(id);
  };

  /**
     * @param {Crate} crate - an instance of a Crate
     */
  this.markCrateReturned = async function (crate) {
    if (crate._data.status[0] === 'delivered') {
      const crateDTO = new CrateDTO(Object.assign(crate._data, {
        status: ['pendingReturn'],
      }));

      await this._repo.crate.markCrateReturned(crateDTO);
    }
  };
}

/**
 * @typedef {Object} VendorDigestTelemetry - flattens a telemetry waypoint object includes vendor-specific fields
 */

/**
 * @param {Object} waypoint - a waypoint object
 */
function VendorDigestTelemetry(waypoint) {
  if (!waypoint) {
    return {
      timestamp: 'null',
      temp: 'null',
      lat: 'null',
      lng: 'null',
      zip: 'null',
      moistureThresholdExceeded: 'null',
      photometerThresholdExceeded: 'null',
      thermometerThresholdExceeded: 'null',
    };
  }

  return {
    timestamp: String(waypoint.timestamp),
    temp: String(waypoint.telemetry.temp.degreesFahrenheit),
    lat: String(waypoint.telemetry.location.coords.lat),
    lng: String(waypoint.telemetry.location.coords.lng),
    zip: String(waypoint.telemetry.location.zip),
    moistureThresholdExceeded: String(waypoint.telemetry.sensors.moisture.thresholdExceeded),
    photometerThresholdExceeded: String(waypoint.telemetry.sensors.photometer.thresholdExceeded),
    thermometerThresholdExceeded: String(waypoint.telemetry.sensors.thermometer.thresholdExceeded),
  };
}

module.exports = { CrateService };
