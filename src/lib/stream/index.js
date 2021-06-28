const { Kafka } = require('kafkajs');
const config = require('../../config');

/* Implements the IStreamService interface
* See interfaces/stream for method documentation
* Manages data streams
*/

/**
 * @implements {IStreamServiceAPI}
 * @returns {Object} an implementation of the IStreamService interface
 */

/* This service ignored because it requires a connection to the
Kafka stream. This service is tested during the integration test suite
*/
/* istanbul ignore next */
function KafkaStreamService() {
  const KAFKA_HOST = config.environment.get('KAFKA_HOST_NAME');

  this.connect = async function () {
    const kafka = new Kafka({
      clientId: 'parcely_core.api',
      brokers: [`${KAFKA_HOST}:9092`],
    });
    this.consumer = kafka.consumer({ groupId: 'parcely' });
    await this.consumer.connect();
  };

  this.subscribe = async function ({ topic, onMessageFn }) {
    if (typeof (onMessageFn) !== 'function') {
      throw Error(`StreamService.BadRequest => onMessage must be of type function, not (${typeof onMessageFn})`);
    }
    await this.consumer.subscribe({ topic, fromBeginning: true });
    await this.consumer.run({
      eachMessage: onMessageFn,
    });
  };
}

/**
 * @implements {IStreamServiceAPI}
 * @returns {Object} an implementation of the IStreamService interface
 */

function MockStreamService() {
  this.connect = async function () {
    // Shouldn't do anything
  };

  this.subscribe = async function ({ onMessageFn }) {
    if (typeof (onMessageFn) !== 'function') {
      throw Error(`StreamService.BadRequest => onMessage must be of type function, not (${typeof onMessageFn})`);
    }
    /* await this.consumer.subscribe({ topic, fromBeginning: true });
     await this.consumer.run({
      eachMessage: onMessageFn,
    }); */
  };
}

module.exports = {
  KafkaStream: KafkaStreamService,
  MockStream: MockStreamService,
};
