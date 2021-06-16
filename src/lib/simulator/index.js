const faker = require('faker');
const routeConfig = require('./config/routes');

/**
 * Returns an observer for handling emission of coordinates from an Observable
 * @param {Crate} crate - an instance of Crate
 * @param {Object} simulation - a reference to the simulation instance
 *  associated with this Observer
 * @param {EventEmitter} eventEmitter - an instance of EventEmitter
 * @returns {Function}
 */
function onCoords(crate, simulation, eventEmitter) {
  const observer = {
    async next(data) {
      // console.table({..data, crate: crate.id});

      const telemetryUpdate = await crate.pushTelemetry({
        temp: {
          degreesFahrenheit: String(faker.datatype.float()),
        },
        location: {
          coords: {
            lat: data.lat,
            lng: data.lng,
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
      try {
        const eventName = 'SSEPublisher.TelemetryUpdateReceived';
        eventEmitter.emit(eventName, [eventName, telemetryUpdate]);
      } catch (e) {
        /* istanbul ignore next */
        console.error(`TelemetryUpdateError: ${e.message}`);
      }
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
