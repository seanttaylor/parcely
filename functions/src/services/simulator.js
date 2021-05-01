const faker = require('faker');
const { from, zip, interval } = require('rxjs');
const { routeConfig, onCoords } = require('../lib/simulator');

/**
 * @param {UserService} userService - an instance of UserService
 * @param {MerchantService} merchantService - an instance of MerchantService
 * @param {CrateService} crateService - an instance of CrateService
 */
function ShipmentSimulatorService({ userService, merchantService, crateService }) {
  const _instances = [];
  const _crateRouteMap = {};
  const _subscriptionList = [];
  let _merchantId;

  /**
   * Sets up all crates for the simulation run
   * @param {Number} instanceCount - number of crates to spin up
   * @param {Number} intervalMillis - interval in milliseconds between
   * simulated telemetry updates
   */
  this.init = async function ({ instanceCount, intervalMillis = 1000 }) {
    this.intervalMillis = intervalMillis;
    const userSim = await userService.createUser({
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phoneNumber: faker.phone.phoneNumber(),
    });

    await userSim.save();

    const merchantSim = await merchantService.createMerchant({
      name: faker.company.companyName(),
      userId: userSim.id,
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: {
        planType: ['smallBusiness'],
        startDate: '01/01/2021',
        expiryDate: '01/01/2022',
        status: [
          'active',
        ],
        autoRenew: true,
      },
    });

    _merchantId = merchantSim.id;

    for (let i = 0; i < instanceCount; i += 1) {
      const crate = crateService.createCrate({
        merchantId: merchantSim.id,
        size: ['M'],
      });

      _instances.push(crate);
    }

    await Promise.all(_instances.map(async (c) => {
      await c.save();
      await c.setRecipient(faker.datatype.uuid());
    }));
  };

  /**
   * Starts a run of the currently configured simulation
   */
  this.start = async function () {
    const shipments = _instances.map(async (crate) => {
      this.assignRoute(crate);
      const shipmentMetadata = routeConfig.routes[_crateRouteMap[crate.id]];
      const { originAddress, destinationAddress, trackingNumber } = shipmentMetadata;

      await crate.startShipment({
        originAddress,
        destinationAddress,
        trackingNumber,
      });
    });
    await Promise.all(shipments);

    this.generateTelemetryUpdates();
  };

  /**
   * Generates telemetry data to send to software-defined crates
   */
  this.generateTelemetryUpdates = function () {
    _instances.forEach((crate) => {
      const routeId = _crateRouteMap[crate.id];
      const coordsList = routeConfig.routes[routeId].waypoints;

      _subscriptionList.push(
        zip(
          from(coordsList),
          interval(this.intervalMillis),
          (value) => value,
        ).subscribe(onCoords(crate)),
      );
    });
  };

  /**
   * Assigns a route to a specified crate
   * @param {Crate} crate - an instance of Crate
   */
  this.assignRoute = function (crate) {
    const routeList = Object.keys(routeConfig.routes);
    _crateRouteMap[crate.id] = routeList[Math.floor(Math.random() * 4)];
  };

  /**
   * Completes a run of the currently configured simulation
   */
  this.end = async function () {
    _instances.length = 0;
    _subscriptionList.forEach((s) => s.unsubscribe());
  };

  /**
   * @returns {Object}
   */
  this.getCrates = function () {
    return _instances;
  };

  /**
   * @returns {String}
   */
  this.getCurrentMerchantId = function () {
    return _merchantId;
  };

  /**
   * Returns of list of crates and their assigned routes
   * @returns {Object}
   */
  this.getCrateRouteMap = function () {
    return _crateRouteMap;
  };
}

module.exports = { ShipmentSimulatorService };
