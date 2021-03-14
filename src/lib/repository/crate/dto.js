/* istanbul ignore file */

const Ajv = require("ajv");
const ajv = new Ajv();
const crateSchema = require("../../../schemas/crate.json");
const crateSchemaValidation = ajv.compile(crateSchema);


/**
 * @typedef {Object} CrateDTO
 * @property {String} id 
 * @property {String} size
 * @property {String} merchantId
 * @property {String} lastPing
 * @property {String} telemetry
 * @property {String} createdDate
 * @property {String|null} lastModified
 */

 /**
  * @param {String} id - uuid for a crate
  * @param {String} size - size of crate
  * @param {String} tripId - uuid for a unique crate trip
  * @param {String} merchantId - uuid for a merchant associated with a specified crate
  * @param {String} lastPing - last ping received from a specified crate
  * @param {Object} telemetry - summary of telemetry data 
  * @param {String} createdDate - date a user was created
  * @param {String|null} lastModified - date crate was last modified
  * @returns {CrateDTO}
  */

function CrateDTO({id, size, tripId=null, merchantId=null, lastPing=null, telemetry, createdDate=new Date().toISOString(), lastModified=null }) {
    const defaultTelemetry = {
        temp: {
            degreesFahrenheit: null
        },
        location: {
            coords: {
                lat: null,
                long: null
            },
            zip: null
        },
        sensors: {
            moisture: {
                thresholdExceeded: false
            },
            thermometer: {
                thresholdExceeded: false
            },
            photometer: {
                thresholdExceeded: false
            }
        }
    };
    const crateData = {
      id,  
      size, 
      tripId, 
      merchantId,
      lastPing,
      telemetry: telemetry || defaultTelemetry,
      createdDate, 
      lastModified
    };
  
  if(!crateSchemaValidation(crateData)) {
    throw new Error(`CrateDTOError/InvalidCrateDTO => ${JSON.stringify(crateSchemaValidation.errors, null, 2)}`);
  }

  this.value = function() {
    return crateData;
  }

}


module.exports = {
    CrateDTO
};