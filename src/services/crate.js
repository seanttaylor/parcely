const uuid = require("uuid");
const {CrateDTO} = require("../lib/repository/crate/dto");
const {CrateTripDTO} = require("../lib/repository/crate-trip/dto");

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
                //TODO: figure out what fields make sense here
            }
        };
    }


    /**
    Saves a new crate to the data store.
    @returns {String} - a uuid for the new user
    */
    this.save = async function() {
        const crateDTO = new CrateDTO(this._data);
        const crate = await this._repo.crate.create(crateDTO);
        
        return crate.id;
    }

    /**
    Associates the crate with a recipient user in the data store.
    @param {String} userId - a uuid for the recipient user
    */
    this.setRecipient = async function(userId) {
        const crateDTO = new CrateDTO(Object.assign(this._data, userId));
        const crate = await this._repo.crate.setCrateRecipient(crateDTO);
        this._data.userId = userId;
    }

    /**
    Pushes telemetry data from the physical crate sensors to the data store
    @param {Object} telemetry - data from the sensors
    */
    this.pushTelemetry = async function(telemetry) {
        const crateDTO = new CrateDTO(Object.assign(this._data, {telemetry}));
        const crate = await this._repo.crate.updateCrateTelemetry(crateDTO);
        this._data.telemetry = telemetry;
    }



    /**
    Remove designated recipient of the crate in the data store.
    this.removeRecipient = async function() {
        
    }*/


    /**
    Initializes a new trip for the current crate
    @param {Object} originAddress - the postal address a crate originates from
    @param {Object} destinationAddress - the postal address a crate ships to
    @param {String} trackingNumber - shipping carrier tracking number associated with this crate for this trip
    */
    this.startTrip = async function({originAddress, destinationAddress, trackingNumber}) {
        const id = uuid.v4();
        const crateTripDTO = new CrateTripDTO({
            id,
            originAddress, 
            destinationAddress, 
            trackingNumber,
            crateId: this._data.id,
            arrivalZip: destinationAddress.zip,
            departureZip: originAddress.zip,
            departureTimestamp: new Date().toISOString()
        });

        const crateTrip = new CrateTrip(this._repo.crateTrip, crateTripDTO);
        crateTrip._data.crateId = this._data.id;

        await crateTrip.save();
        await this._repo.crate.startCrateTrip(new CrateDTO(Object.assign(this._data, {
            status: ["inTransit"]
        })));
        
        this._data.status = ["inTransit"];
        this.currentTrip = crateTrip;
        return crateTrip.id;
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
    
    this.toJSON = function() {
        return {
            id: this.id,
            createdDate: this._data.createdDate,
            lastModified: this._data.lastModified,
            data: {
                //TODO: figure out what fields make sense here
            }
        };
    }


    /**
    Saves a new CrateTrip to the data store.
    @returns {String} - a uuid for the new user
    */
    this.save = async function() {
        const crateTripDTO = new CrateTripDTO(this._data);
        const crateTrip = await this._repo.create(crateTripDTO);
        return crateTrip.id;
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

    this.createCrate = async function(doc) {
        const id = uuid.v4();
        const data = Object.assign({id}, doc);
        return new Crate(this._repo, new CrateDTO(data));
    }


    this.getCrateById = async function(id) {
        const crate = await this._repo.crate.getCrateById(id);
        return new Crate(this._repo.crate, new CrateDTO(crate));
    }

    
    this.getAllCrates = async function() {
        const crates = await this._repo.crate.getAllCrates();
        return crates.map((c) => new Crate(this._repo.crate, new CrateDTO(c)));
    }

    /**
     * @param {User} user - an instance of a User
    */
    this.getCratesByUser = async function(user) {
        const crateList = await this._repo.crate.getCratesByUserId(user.id);
        return crateList.map((c) => new Crate(this._repo.crate, new CrateDTO(c)));
    }


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
     * @param {Crate} crate - an instance of a Crate
    */
    this.getCurrentCrateTelemetry = async function(crate) {
        const {telemetry} = await this._repo.crate.getCrateById(crate.id);
        return telemetry;
    }


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

module.exports = CrateService;