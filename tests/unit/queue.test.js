/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';

const IQueue = require('../../src/interfaces/queue');
const { InMemoryQueue } = require('../../src/lib/queue');

const testQueueService = new IQueue(new InMemoryQueue());
const faker = require('faker');

test('Should be able to add a new entry to the queue', async () => {
  await testQueueService.enqueue({ id: 'foo', value: 'bar' });
  const queueSize = await testQueueService.size();
  expect(queueSize > 0).toBe(true);
});

test('Should be able to remove an existing entry from the queue', async () => {
  await testQueueService.enqueue({
    id: faker.lorem.word(),
    value: faker.lorem.word(),
  });
  await testQueueService.enqueue({
    id: faker.lorem.word(),
    value: faker.lorem.word(),
  });

  const [item] = await testQueueService.dequeue();

  expect(Object.keys(item).includes('id')).toBe(true);
  expect(Object.keys(item).includes('id')).toBeTruthy();
  expect(Object.keys(item).includes('value')).toBe(true);
  expect(Object.keys(item).includes('value')).toBeTruthy(); 1;
});

test('Should be able to get the current size of the queue', async () => {
  await testQueueService.enqueue({
    id: faker.lorem.word(),
    value: faker.lorem.word(),
  });

  const queueSize = await testQueueService.size();

  expect(typeof (queueSize) === 'number').toBe(true);
});
