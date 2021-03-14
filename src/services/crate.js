const uuid = require("uuid");
const {CrateDTO} = require("../lib/repository/crate/dto");

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
            }
        };
    }


    /**
    Saves a new user to the data store.
    @returns {String} - a uuid for the new user
    */
    this.save = async function() {
        const crateDTO = new CrateDTO(this._data);
        const crate = await this._repo.create({crateDTO});
        
        return crate.id;
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
        const [crate] = await this._repo.getCrateById(id);
        return [new Crate(repo, new CrateDTO(crate))];
    }

    
    this.getAllCrates = async function() {
        const crates = await this._repo.getAllCrates();
        return crates.map((c) => new Crate(repo, new CrateDTO(c)));
    }


    this.getCratesByUser = async function() {
        const crates = await this._repo.getCratesByUser();
        return crates.map((c) => new Crate(repo, new CrateDTO(c)));
    }


    this.getCrateByTripId = async function(tripId) {
        const crateList = await this._repo.getCrateByTripId(tripId);
        return crateList.map((c) => new Crate(this._repo, new CrateDTO(c)));
    }


    this.getCrateTripsByCrateId = async function(id) {
        const crateTripList = await this._repo.getCrateTripsByCrateId(id);
        return crateTripList.map((t) => new CrateTrip(this._repo, new CrateTripDTO(t)));
    }

    
    this.getCurrentCrateTelemetryById = async function(id) {
        const [crateTelemetry] = await this._repo.getCurrentCrateTelemetryById(id);
        return crateTelemetry;
    }


    this.deleteCrate = async function(id) {
        await this._repo.deleteCrate(id);
    }


    this.markCrateReturned = async function(id) {
        await this._repo.markCrateReturned(id);
    }

}

module.exports = CrateService;