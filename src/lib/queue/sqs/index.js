/* istanbul ignore file */

/* Implements the IQueue interface
 * Manages queue entries on an AWS SQS instance
 * See interfaces/queue for method documentation
 * See https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/sqs-examples.html
 */

const AWS = require('aws-sdk');
const { promisify } = require('util');
const queueConfig = require('./config');

AWS.config.update({
  region: process.env.AWS_REGION,
});

/**
 * @implements {IQueueAPI}
 * @param {Object} queueURL - URL of the SQS queue
 * @returns {Object} an implementation of the IQueue interface
 */

function SQSQueue(queueURL) {
  queueConfig.QueueUrl = queueURL;

  /* Ensure the `endpoint` URL is set to the hostname pointing to LocalStack in **local development**. If the`endpoint` property is not set the AWS SDK will attempt to call actual AWS Cloud endpoints resulting in any number of errors
    */
  const currentQueue = new AWS.SQS({
    apiVersion: '2012-11-05',
    endpoint: 'http://localhost:4566',
  });

  currentQueue.sendMessage = promisify(currentQueue.sendMessage);

  /**
     * @returns {Integer} the size of the current queue
     */
  this.enqueue = async function (entry) {
    const params = {
      DelaySeconds: 10,
      MessageAttributes: {},
      MessageBody: JSON.stringify(entry),
      QueueUrl: queueURL,
    };

    try {
      await currentQueue.sendMessage(params);
      // console.log(`QueueService.SQS.MessageSent: (MessageID: ${data.MessageId})`);
    } catch (err) {
      console.error('QueueService.SQS.EnqueueError =>', err);
    }
  };

  /**
     * @returns {Object} - the queue entry
     */
  this.dequeue = async function () {
    currentQueue.receiveMessage = promisify(currentQueue.receiveMessage);
    currentQueue.deleteMessage = promisify(currentQueue.deleteMessage);

    const messageList = await currentQueue.receiveMessage(queueConfig);
    if (messageList.Messages) {
      const deleteParams = {
        QueueUrl: queueURL,
        ReceiptHandle: messageList.Messages[0].ReceiptHandle,
      };
      await currentQueue.deleteMessage(deleteParams);
      // console.log("QueueService.SQS.MessageDequeued", data);
      return messageList.Messages.map((message) => JSON.parse(message.Body));
    }

    return [];
  };

  /**
     * @returns {Integer} - the size of the queue
     */

  this.size = async function () {
    const params = {
      QueueUrl: queueURL,
      AttributeNames: ['ApproximateNumberOfMessages'],
    };

    currentQueue.getQueueAttributes = promisify(currentQueue.getQueueAttributes);

    const { Attributes: { ApproximateNumberOfMessages } } = await currentQueue.getQueueAttributes(params);
    return Number(ApproximateNumberOfMessages);
  };
}

module.exports = SQSQueue;
