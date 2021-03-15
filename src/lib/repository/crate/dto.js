/* istanbul ignore file */

const Ajv = require("ajv");
const ajv = new Ajv();
const crateSchema = require("../../../schemas/crate.json");
const crateTripSchema = require("../../../schemas/trip.json");
const crateTripSchemaValidation = ajv.compile(crateTripSchema);
const crateSchemaValidation = ajv.compile(crateSchema);
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

/**
 * @typedef {Object} CrateDTO
 * @property {String} id 
 * @property {String} status
 * @property {String} size
 * @property {String} merchantId
 * @property {String} lastPing
 * @property {String} telemetry
 * @property {String} createdDate
 * @property {String|null} lastModified
 */

 /**
  * @param {String} id - uuid for a crate
  * @param {String} status - status of crate
  * @param {String} size - size of crate
  * @param {String} tripId - uuid for a unique crate trip
  * @param {String} merchantId - uuid for a merchant associated with a specified crate
  * @param {String} lastPing - last ping received from a specified crate
  * @param {Object} telemetry - summary of telemetry data 
  * @param {String} createdDate - date a user was created
  * @param {String|null} lastModified - date crate was last modified
  * @returns {CrateDTO}
  */

function CrateDTO({id, size, status=["awaitingDeployment"], tripId=null, merchantId=null, userId=null, lastPing=null, telemetry, createdDate=new Date().toISOString(), lastModified=null }) {
    
    const crateData = {
      id,
      status,  
      size, 
      tripId, 
      merchantId,
      userId,
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


/**
 * @typedef {Object} CrateTripDTO
 * @property {String} id 
 * @property {String} departureTimestamp
 * @property {String} arrivalTimestamp
 * @property {String} departureZip
 * @property {String} arrivalZip
 * @property {String} trackingNumber
 * @property {String} createdDate
 * @property {String} tripLengthMiles
 * @property {Object} originAddress - the postal address a crate originates from
 * @property {Object} destinationAddress - the postal address a crate ships to
 */

/**
 * @param {String} id - uuid for a crate
 * @param {String} departureTimestamp - datetime of crate departure (i.e. when the crate trip is initialized)
 * @param {String} arrivalTimestamp - datetime of crate arrival (i.e. when crate trip is concluded)
 * @param {String} departureZip - departue zip code
 * @param {String} arrivalZip - arrival zip code
 * @param {String} trackingNumber - Shipping carrier tracking number associated with this crate for this trip
 * @param {String} waypoints - list of each point in the trip where the crate pushed telemetry data to the logistics API
 * @param {String|null} lastModified - datetime crate trip data was last modified
 * @param {String} tripLengthMiles - estimated length of the trip in miles
 * @param {Object} originAddress - the postal address a crate originates from
 * @param {Object} destinationAddress - the postal address a crate ships to
 * @param {String} createdDate - datetime a crate trip is created
 * @returns {CrateTripDTO}
 */

function CrateTripDTO({id, departureTimestamp, arrivalTimestamp=null, trackingNumber, departureZip, arrivalZip, waypoints=[], createdDate=new Date().toISOString(), lastModified=null, tripLengthMiles=null, originAddress, destinationAddress}) {
    
    const crateTripData = {
      id,
      departureTimestamp, 
      arrivalTimestamp, 
      trackingNumber, 
      departureZip, 
      arrivalZip,
      waypoints, 
      createdDate, 
      lastModified,
      tripLengthMiles,
      originAddress, 
      destinationAddress
    };
  

  if(!crateTripSchemaValidation(crateTripData)) {
    throw new Error(`CrateTripDTOError/InvalidCrateTripDTO => ${JSON.stringify(crateTripSchemaValidation.errors, null, 2)}`);
  }

  this.value = function() {
    return crateTripData;
  }

}

module.exports = {
    CrateDTO,
    CrateTripDTO
};