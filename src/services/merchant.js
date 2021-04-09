const uuid = require("uuid");
const coreUtils = require("../lib/utils");
const {MerchantDTO} = require("../lib/repository/merchant/dto");


/**
* @typedef {Object} Merchant
* @property {String} id - the uuid of the merchant
* @property {Object} _data - the merchant data
* @property {Object} _repo - the repository instance associated with this merchant
*/

/**
 * 
 * @param {Object} repo - the repo associated with this user
 * @param {MerchantDTO} merchantDTO - an instance of the MerchantDTO
 */

function Merchant(repo, merchantDTO) {
    const dtoData = merchantDTO.value();
    
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
                userId: this._data.userId,
                name: this._data.name, 
                address: this._data.address,
                emailAddress: this._data.emailAddress,
                plan: this._data.plan
            }
        };
    }

    /**
    Saves a new merchant to the data store
    @returns {String} - a uuid for the new merchant
    */
    this.save = async function() {
        const merchantDTO = new MerchantDTO(this._data);
        const merchant = await this._repo.create(merchantDTO);
        
        return merchant.id;
    }

    /**
    Updates an existing plan for a merchant
    @param {Object} plan - valid Parcely plan
    */
    this.updatePlan = async function(plan) {
        const updatedPlan = Object.assign(this._data.plan, plan);
        const merchantDTO = new MerchantDTO(Object.assign(this._data, {
            plan: updatedPlan
        }));
        const merchant = await this._repo.updateMerchantPlan(merchantDTO);
        
        this._data.plan = updatedPlan;
    }

    /**
    Cancels an existing plan for a merchant
    @returns
    */
    this.cancelPlan = async function() {
        const cancelledPlan = Object.assign(this._data.plan, {
            status: ["cancelled"]
        });
        const merchantDTO = new MerchantDTO(Object.assign(this._data, {
            plan: cancelledPlan
        }));

        const merchant = await this._repo.updateMerchantPlan(merchantDTO);
        
        this._data.plan = cancelledPlan;
    }

}




/**
* @typedef {Object} MerchantService
* @property {Object} _repo - the repository associated with this service
*/

/**
 * 
 * @param {Object} repo - the repos associated with this service
 */

function MerchantService(repo) {
    this._repo = repo;
    
    /**
     * @param {Object} doc - object representing valid merchant data
     */
    this.createMerchant = async function(doc) {
        const id = uuid.v4();
        const data = Object.assign({id}, doc);
        return new Merchant(this._repo, new MerchantDTO(data));
    }

    /**
     * @param {String} id - a uuid for a merchant
     */
    this.getMerchantById = async function(id) {
        const merchantData = await this._repo.getMerchantById(id);
        
        if (!merchantData) {
            return;
        }

        return new Merchant(this._repo, new MerchantDTO(merchantData));
    }

    /*
    this.getAllMerchants = async function() {
        const crates = await this._repo.crate.getAllCrates();
        return crates.map((c) => new Crate(this._repo.crate, new CrateDTO(c)));
    }
    */

    /**
     * @param {Merchant} merchant - an instance of a Merchant
     */
    /*this.archiveMerchant = async function(user) {
        const crateList = await this._repo.crate.getCratesByRecipientId(user.id);
        return crateList.map((c) => new Crate(this._repo.crate, new CrateDTO(c)));
    }*/

    /**
     * @param {String} id - a uuid of a Merchant
     */
    /*this.merchantExists = async function(id) {
        const shipmentData = await this._repo.crateShipment.getCrateShipmentById(shipmentId);
        const shipment = new CrateShipment(this._repo.crateShipment, new CrateShipmentDTO(shipmentData));
        
        shipment._data.waypointsIncluded = includeWaypoints;

        if (!includeWaypoints) {
            shipment._data.waypoints = [];
        }
       
        return shipment;
    }*/
 
}

module.exports = { MerchantService };