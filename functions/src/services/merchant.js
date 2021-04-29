const uuid = require('uuid');
const { MerchantDTO } = require('../lib/repository/merchant/dto');

/**
 * @typedef {Object} Merchant
 * @property {String} id - the uuid of the merchant
 * @property {Object} _data - the merchant data
 * @property {Object} _repo - the repository instance associated with this entity
 */

/**
 *
 * @param {Object} repo - the repo associated with this entity
 * @param {MerchantDTO} merchantDTO - an instance of the MerchantDTO
 */

function Merchant(repo, merchantDTO) {
  const dtoData = merchantDTO.value();

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
        userId: this._data.userId,
        name: this._data.name,
        address: this._data.address,
        emailAddress: this._data.emailAddress,
        plan: this._data.plan,
        status: this._data.status,
      },
    };
  };

  /**
     * Saves a new merchant to the data store
     * @returns {String} - a uuid for the new merchant
    */
  this.save = async function () {
    const merchantDTO = new MerchantDTO(this._data);
    const merchant = await this._repo.create(merchantDTO);

    return merchant.id;
  };

  /**
     * Updates an existing plan for a merchant
     * @param {Object} plan - valid Parcely plan
    */
  this.updatePlan = async function (plan) {
    if (this._data.status[0] === 'archived') {
      return;
    }

    const updatedPlan = { ...this._data.plan, ...plan };
    const merchantDTO = new MerchantDTO(Object.assign(this._data, {
      plan: updatedPlan,
    }));

    await this._repo.updateMerchantPlan(merchantDTO);

    this._data.plan = updatedPlan;
  };

  /**
     * Cancels an existing plan for a merchant
     * @returns
    */
  this.cancelPlan = async function () {
    const cancelledPlan = {
      ...this._data.plan,
      status: ['cancelled'],
      autoRenew: false,
    };
    const merchantDTO = new MerchantDTO(Object.assign(this._data, {
      plan: cancelledPlan,
    }));

    await this._repo.updateMerchantPlan(merchantDTO);

    this._data.plan = cancelledPlan;
  };
}

/**
 * @typedef {Object} MerchantService
 * @property {Object} _repo - the repository associated with this service
 */

/**
 *
 * @param {Object} repo - the repos associated with this service
 * @param {UserService} userService - an instance of the UserService
 */

function MerchantService(repo, userService) {
  this._repo = repo;

  /**
     * @param {Object} doc - object representing valid merchant data
     */
  this.createMerchant = async function (doc) {
    /* for successful merchant account creation user account SHOULD already exist and merchant account SHOULD NOT already exist */

    const userExists = await userService.userExists(doc.userId);
    const merchantAlreadyExists = await this.merchantExists(doc.userId);

    if (!userExists) {
      throw new Error('MerchantServiceError.CannotCreateMerchant.BadRequest.UserDoesNotExist => Merchant account cannot be created for user that does not exist.');
    }

    if (!merchantAlreadyExists) {
      const id = uuid.v4();
      const data = { id, ...doc };
      return new Merchant(this._repo, new MerchantDTO(data));
    }

    throw new Error('MerchantServiceError.CannotCreateMerchant.BadRequest.UserIsAlreadyMerchant => Merchant account cannot be created for user already assigned a merchant account');
  };

  /**
     * @param {String} id - a uuid for a merchant\
     * @returns {Object}
     */
  this.getMerchantById = async function (id) {
    const merchantData = await this._repo.getMerchantById(id);

    if (!merchantData) {
      return undefined;
    }

    return new Merchant(this._repo, new MerchantDTO(merchantData));
  };

  /*
    this.getAllMerchants = async function() {
        const crates = await this._repo.crate.getAllCrates();
        return crates.map((c) => new Crate(this._repo.crate, new CrateDTO(c)));
    }
    */

  /**
     * @param {Merchant} merchant - an instance of a Merchant
     */
  this.archiveMerchant = async function (merchant) {
    const merchantDTO = new MerchantDTO(Object.assign(merchant._data, {
      status: ['archived'],
    }));

    await this._repo.archiveMerchant(merchantDTO);

    Object.assign(merchant._data, {
      status: ['archived'],
    });
  };

  /**
     * @param {String} id - a uuid of a User
     */
  this.merchantExists = async function (userId) {
    const merchantList = await this._repo.getAllMerchants();
    return merchantList.find((m) => m.userId === userId);
  };
}

module.exports = { MerchantService };
