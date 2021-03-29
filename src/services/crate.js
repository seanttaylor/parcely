const uuid = require("uuid");
const coreUtils = require("../lib/utils");
const {CrateDTO} = require("../lib/repository/crate/dto");
const {CrateTripDTO, CrateTelemetryDTO} = require("../lib/repository/crate-trip/dto");

/**
* @typedef {Object} Crate
* @property {String} id - the uuid of the user
* @property {Object} _data - the user data
* @property {Object} _repo - the repository instance associated with this user
*/

/**
 * 
 * @param {Object} repo - the repo associated with this user
 * @param {crateDTO} crateDTO - an instance of the CrateDTO
 */

function Crate(repo, crateDTO) {
    const dtoData = crateDTO.value();
    
    this._data = dtoData;
    this._repo = repo;
    this.id = dtoData.id;
    
    this.toJSON = function() {
        return {
            id: this.id,
            createdDate: this._data.createdDate,
            lastModified: this._data.lastModified,
            data: {
                id: this.id,
                size: this._data.size, 
                tripId: this._data.tripId,
                merchantId: this._data.merchantId,
                recipientId: this._data.recipientId,
                telemetry: this._data.telemetry,
                lastPing: this._data.lastPing
            }
        };
    }


    /**
    Saves a new crate to the data store
    @returns {String} - a uuid for the new user
    */
    this.save = async function() {
        const crateDTO = new CrateDTO(this._data);
        const crate = await this._repo.crate.create(crateDTO);
        
        return crate.id;
    }

    /**
    Associates the crate with a recipient user in the data store
    @param {String} recipientId - a uuid for the recipient user
    */
    this.setRecipient = async function(recipientId) {
        if (this._data.recipientId) {
            throw new Error("CrateError.CannotSetRecipient => Recipient has already been assigned for this crate");
        }

        const crateDTO = new CrateDTO(Object.assign(this._data, recipientId));
        const crate = await this._repo.crate.setCrateRecipient(crateDTO);
        this._data.recipientId = recipientId;
    }

    /**
    Pushes telemetry data from the physical crate sensors to the data store
    @param {Object} telemetry - data from the sensors
    */
    this.pushTelemetry = async function(telemetry) {
        const [currentTripStatus] = this.currentTrip._data.status;

        if (currentTripStatus === "complete") {
            return;
        } 

        const timestamp = new Date().toISOString();
        const crateDTO = new CrateDTO(Object.assign(this._data, {
            telemetry,
            lastPing: timestamp
        }));
        
        await this._repo.crate.updateCrateTelemetry(crateDTO);
        await this.currentTrip.addWaypoint({timestamp, telemetry});
        this._data.telemetry = telemetry;
    }


    /**
    Returns the most recent crate telemetry data
    @param {Object} telemetry - data from the sensors
    */
    this.getCurrentTelemetry = async function() {
        const {telemetry} = await this._repo.crate.getCrateById(this.id);
        return telemetry;
    }


    /**
    Initializes a new trip for the current crate
    @param {Object} originAddress - the postal address a crate originates from
    @param {Object} destinationAddress - the postal address a crate ships to
    @param {String} trackingNumber - shipping carrier tracking number associated with this crate for this trip
    */
    this.startTrip = async function({originAddress, destinationAddress, trackingNumber}) {
        if (!this._data.merchantId) {
            throw new Error("CrateError.CannotStartTrip.missingMerchantId => Cannot start crate trip without merchantId assigned to associated crate");
        }

        if (!this._data.recipientId) {
            throw new Error("CrateError.CannotStartTrip.missingRecipientId => Cannot start crate trip without recipientId assigned to associated crate")
        }

        const id = uuid.v4();
        const status = ["inTransit"];
        const crateTripDTO = new CrateTripDTO({
            id,
            crateId: this._data.id,
            recipientId: this._data.recipientId,
            originAddress, 
            destinationAddress, 
            trackingNumber,
            arrivalZip: destinationAddress.zip,
            departureZip: originAddress.zip,
            departureTimestamp: new Date().toISOString()
        });

        const crateTrip = new CrateTrip(this._repo.crateTrip, crateTripDTO);
        crateTrip._data.crateId = this._data.id;

        await crateTrip.save();
        await this._repo.crate.startCrateTrip(new CrateDTO(Object.assign(this._data, {
            status
        })));
        
        this._data.status = status;
        this._data.tripId = id;
        this.currentTrip = crateTrip;
        return crateTrip.id;
    }


    /**
    Completes an existing trip for the current crate; crate trip data becomes read-only
    */
    this.completeTrip = async function() {
        const status = ["complete"];
        const arrivalTimestamp = new Date().toISOString();
        const crateDTO = new CrateDTO(Object.assign({}, this._data, {
            tripId: null,
            recipientId: null
        }));
        const crateTripDTO = new CrateTripDTO(
            Object.assign({}, this.currentTrip._data, {
                status,
                crateId: this._data.id,
                arrivalTimestamp
            })
        );

        await this._repo.crate.setCrateRecipient(crateDTO);
        await this._repo.crateTrip.completeCrateTrip(crateTripDTO);
        this.currentTrip._data.status = status;
        this._data.recipientId = null;
        this._data.tripId = null;
    }
}


/**
* @typedef {Object} CrateTrip
* @property {String} id - the uuid of the crateTrip
* @property {Object} _data - the crateTrip data
* @property {Object} _repo - the repository instance associated with this trip
*/

/**
 * 
 * @param {Object} repo - the repo associated with this crateTrip
 * @param {crateTripDTO} crateTripDTO - an instance of the CrateTripDTO
 */

function CrateTrip(repo, crateTripDTO) {
    const dtoData = crateTripDTO.value();
    
    this._data = dtoData;
    this._repo = repo;
    this.id = dtoData.id;
    this.waypoints = dtoData.waypoints;
    
    this.toJSON = function() {
        return {
            id: this.id,
            createdDate: this._data.createdDate,
            lastModified: this._data.lastModified,
            data: {
                id: this.id,
                crateId: this._data.crateId,
                recipientId: this._data.recipientId,
                departureTimestamp: this._data.departureTimestamp,
                departureZip: this._data.departureZip,
                arrivalTimestamp: this._data.arrivalTimestamp,
                arrivalZip: this._data.arrivalZip,
                trackingNumber: this._data.trackingNumber,
                originAddress: this._data.originAddress,
                destinationAddress: this._data.destinationAddress,
                status: this._data.status,
                waypoints: this._data.waypoints
                
            }
        };
    }


    /**
    Saves a new CrateTrip to the data store
    @returns {String} - a uuid for the new user
    */
    this.save = async function() {
        const crateTripDTO = new CrateTripDTO(this._data);
        const crateTrip = await this._repo.create(crateTripDTO);
        return crateTrip.id;
    }


    /**
    Adds a new waypoint to an existing trip
    @param {String} timestamp - date/time telemetry data was recorded
    @param {Object} telemetry - sensor data collected from the hardware crate
    */
    this.addWaypoint = async function({timestamp, telemetry}) {
        const [currentTripStatus] = this._data.status;

        if (currentTripStatus === "complete") {
            return; 
        }

        const crateTelemetryDTO = new CrateTelemetryDTO({timestamp, telemetry});
        const crateTelemetry = crateTelemetryDTO.value();
        this._data.waypoints.push(crateTelemetry);
        // freeze all telemetry objects in the waypoints list
        this._data.waypoints = this._data.waypoints.map(coreUtils.deepFreeze);

        const crateTripDTO = new CrateTripDTO(Object.assign({}, this._data));
        
        await this._repo.addTripWaypoint(crateTripDTO);
        // copy the internal waypoints list to an public read-only property
        this.waypoints = coreUtils.deepFreeze([...this._data.waypoints]);
    }
}

/**
* @typedef {Object} CrateService
* @property {Object} _repo - the repository associated with this service
*/

/**
 * 
 * @param {Object} repo - the repos associated with this service
 */

function CrateService({crateRepo, crateTripRepo}) {
    this._repo = {
        crate: crateRepo,
        crateTrip: crateTripRepo
     }
    
    /**
     * @param {Object} doc - object representing valid crate data
     */
    this.createCrate = async function(doc) {
        const id = uuid.v4();
        const data = Object.assign({id}, doc);
        return new Crate(this._repo, new CrateDTO(data));
    }

    /**
     * @param {String} id - a uuid for a crate
     */
    this.getCrateById = async function(id) {
        const crateData = await this._repo.crate.getCrateById(id);
        const crate = new Crate(this._repo.crate, new CrateDTO(crateData));
        const {tripId} = crate._data;

        if (tripId) {
            const crateTripData = await this._repo.crateTrip.getCrateTripById(tripId);
            const crateTrip = new CrateTrip(this._repo.crateTrip, new CrateTripDTO(crateTripData));
            crate.currentTrip = crateTrip;
        } 
       
        return crate;
    }

    
    this.getAllCrates = async function() {
        const crates = await this._repo.crate.getAllCrates();
        return crates.map((c) => new Crate(this._repo.crate, new CrateDTO(c)));
    }

    /**
     * @param {User} user - an instance of a User
     */
    this.getCratesByRecipient = async function(user) {
        const crateList = await this._repo.crate.getCratesByRecipientId(user.id);
        return crateList.map((c) => new Crate(this._repo.crate, new CrateDTO(c)));
    }

    /**
     * @param {String} tripId - a uuid of a CrateTrip
     */
    this.getCrateTripById = async function(tripId) {
        const tripData = await this._repo.crateTrip.getCrateTripById(tripId);
        return new CrateTrip(this._repo.crateTrip, new CrateTripDTO(tripData));
    }

    /**
     * @param {Crate} crate - an instance of a Crate
     */
    this.getCrateTrips = async function(crate) {
        const crateTripList = await this._repo.crateTrip.getCrateTripsByCrateId(crate.id);

        return crateTripList.map((t) => new CrateTrip(this._repo.crateTrip, new CrateTripDTO(t)));
    }

    /**
     * @param {User} user - an instance of a User
     * @param {Object} options - an options object 
     */
    this.getShipmentHistoryOf = async function(user, {filterBy}) {
        const crateTripList = await this._repo.crateTrip.getCrateTripsByRecipientId(user.id);

        return crateTripList.filter((t) => {
            if (filterBy) {
                return t.status[0] === filterBy;
            }
            return true;  
        })
        .map((t) => new CrateTrip(this._repo.crateTrip, new CrateTripDTO(t)));
    }

    /**
     * @param {String} id - a uuid for a crate
     */
    this.deleteCrate = async function(id) {
        await this._repo.crate.deleteCrate(id);
    }

    /**
     * @param {Crate} crate - an instance of a Crate
     */
    this.markCrateReturned = async function(crate) {
        const crateDTO = new CrateDTO(Object.assign(crate._data, {
            status: ["pendingReturn"]
        }));

        await this._repo.crate.markCrateReturned(crateDTO);
    }

}

module.exports = { CrateService };