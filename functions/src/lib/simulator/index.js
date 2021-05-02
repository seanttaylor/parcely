const faker = require('faker');
const routeConfig = require('./config/routes');

/**
 * Returns an observer for handling emission of coordinates from an Observable
 * @param {Crate} crate - an instance of Crate
 * @param {Object} simulation - a reference to the simulation instance
 *  associated with this Observer
 * @returns {Function}
 */
function onCoords(crate, simulation) {
  const observer = {
    next(data) {
      crate.pushTelemetry({
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
      });
    },
    complete() {
      simulation.completedInstances.add(crate.id);
      if (simulation.completedInstances.size === simulation.getCrates().length) {
        // console.log(`Simulation (${simulation.id}) complete`);
        simulation.end();
      }
    },
  };

  return observer;
}

module.exports = {
  routeConfig,
  onCoords,
};
