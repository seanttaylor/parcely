const faker = require('faker');
const routeConfig = require('./config/routes');

/**
 * Returns an observer for handling emission of coordinates from an Observable
 * @param {Crate} crate - an instance of Crate
 * @returns {Function}
 */
function onCoords(crate) {
  const observer = {
    next(data) {
      crate.currentTrip.addWaypoint({
        crateId: crate.id,
        telemetry: {
          temp: {
            degreesFahrenheit: String(faker.datatype.float()),
          },
          location: {
            coords: {
              lat: data.lat,
              long: data.lng,
            },
            zip: faker.address.zipCode(),
          },
          sensors: {
            moisture: {
              thresholdExceeded: false,
            },
            thermometer: {
              thresholdExceeded: false,
            },
            photometer: {
              thresholdExceeded: false,
            },
          },
        },
      });
    },
  };

  return observer;
}

module.exports = {
  routeConfig,
  onCoords,
};
