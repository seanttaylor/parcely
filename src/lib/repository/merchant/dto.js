/* istanbul ignore file */

const Ajv = require("ajv");
const ajv = new Ajv();
const merchantSchema = require("../../../schemas/merchant.json");
const merchantSchemaValidation = ajv.compile(merchantSchema);

/**
 * @typedef {Object} MerchantDTO
 * @property {String} id 
 * @property {String} userId
 * @property {String} name
 * @property {Object} plan
 * @property {String} phoneNumber
 * @property {Object} address
 * @property {String} emailAddress
 * @property {String} createdDate
 * @property {String|null} lastModified
 */

 /**
  * @param {String} id - uuid for a merchant
  * @param {String} userId - userId for a merchant
  * @param {String} name - name of the merchant (e.g. the business name)
  * @param {String} phoneNumber - phone number of merchant (e.g. the business phone)
  * @param {Object} plan - Parcely plan associated with merchant
  * @param {Object} address - address of the merchant (e.g. business address)
  * @param {String} emailAddress - email address of merchant (e.g. business email)
  * @param {String} createdDate - date a user was created
  * @param {String|null} lastModified - date crate was last modified
  * @returns {MerchantDTO}
  */

function MerchantDTO({id, userId, name, plan, address, emailAddress, createdDate=new Date().toISOString(), phoneNumber, lastModified=null }) {
    
    const merchantData = {
      id,
      userId,
      name,
      phoneNumber,  
      plan, 
      address, 
      emailAddress,
      createdDate, 
      lastModified
    };
  
  if(!merchantSchemaValidation(merchantData)) {
    throw new Error(`MerchantDTOError/InvalidMerchantDTO => ${JSON.stringify(merchantSchemaValidation.errors, null, 2)}`);
  }

  this.value = function() {
    return merchantData;
  }

}

module.exports = {
    MerchantDTO
};