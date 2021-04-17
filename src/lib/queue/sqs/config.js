/**
 * Configuration for AWS SQS queue instances
 * See https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sqs-examples.html
 */


module.exports = {
    AttributeNames: ["SentTimestamp"],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: ["All"],
    QueueUrl: null,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 0,
};