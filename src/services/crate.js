const uuid = require("uuid");
const {CrateDTO, CrateTripDTO} = require("../lib/repository/crate/dto");

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
        const crate = await this._repo.create({crateDTO});
        
        return crate.id;
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
        const crateTrip = await this._repo.create({crateTripDTO});
        
        return crateTrip.id;
    }
}

/**
* @typedef {Object} CrateService
* @property {Object} _repo - the repository associated with this service
*/

/**
 * 
 * @param {Object} repo - the repo associated with this service
 */

function CrateService(repo) {
    this._repo = repo;

    this.createCrate = async function(doc) {
        const id = uuid.v4();
        const data = Object.assign({id}, doc);
        return new Crate(repo, new CrateDTO(data));
    }


    this.getCrateById = async function(id) {
        const crate = await this._repo.getCrateById(id);
        return [new Crate(repo, new CrateDTO(crate))];
    }

    
    this.getAllCrates = async function() {
        const crates = await this._repo.getAllCrates();
        return crates.map((c) => new Crate(repo, new CrateDTO(c)));
    }


    this.getCratesByUser = async function() {
        const crateList = await this._repo.getCratesByUser();
        return crateList.map((c) => new Crate(repo, new CrateDTO(c)));
    }


    this.getCrateTripById = async function(tripId) {
        const tripData = await this._repo.getCrateTripById(tripId);
        return new CrateTrip(this._repo, new CrateTripDTO(tripData));
    }

    /**
     * @param {Crate} crate - an instance of a Crate
    */
    this.getCrateTrips = async function(crate) {
        const crateTripList = await this._repo.getCrateTripsByCrateId(crate.id);
        return crateTripList.map((t) => new CrateTrip(this._repo, new CrateTripDTO(t)));
    }


    /**
     * @param {Crate} crate - an instance of a Crate
    */
    this.getCurrentCrateTelemetry = async function(crate) {
        const {telemetry} = await this._repo.getCrateById(crate.id);
        return telemetry;
    }


    this.deleteCrate = async function(id) {
        await this._repo.deleteCrate(id);
    }

    /**
     * @param {Crate} crate - an instance of a Crate
    */
    this.markCrateReturned = async function(crate) {
        const crateDTO = new CrateDTO(Object.assign(crate._data, {
            status: ["pendingReturn"]
        }));

        await this._repo.markCrateReturned(crateDTO);
    }

}

module.exports = CrateService;