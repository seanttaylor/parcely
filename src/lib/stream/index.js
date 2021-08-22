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
function RemoteKafkaStreamService() {
  const KAFKA_BOOTSTRAP_SERVER = config.environment.get('KAFKA_BOOTSTRAP_SERVER');
  const KAFKA_CLUSTER_API_KEY = config.environment.get('KAFKA_CLUSTER_API_KEY');
  const KAFKA_CLUSTER_SECRET = config.environment.get('KAFKA_CLUSTER_SECRET');
  const sasl = {
    username: KAFKA_CLUSTER_API_KEY,
    password: KAFKA_CLUSTER_SECRET,
    mechanism: 'plain',
  };
  const ssl = true;

  this.connect = async function () {
    const kafka = new Kafka({
      clientId: 'parcely_core.api',
      brokers: [`${KAFKA_BOOTSTRAP_SERVER}`],
      sasl,
      ssl,
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

/* This service ignored because it requires a connection to the
Kafka stream. This service is tested during the integration test suite
*/

/* istanbul ignore next */
function LocalKafkaStreamService() {
  const KAFKA_BOOTSTRAP_SERVER = config.environment.get('KAFKA_BOOTSTRAP_SERVER');

  this.connect = async function () {
    const kafka = new Kafka({
      clientId: 'parcely_core.api',
      brokers: [`${KAFKA_BOOTSTRAP_SERVER}`],
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
  RemoteStream: RemoteKafkaStreamService,
  LocalStream: LocalKafkaStreamService,
  MockStream: MockStreamService,
};
