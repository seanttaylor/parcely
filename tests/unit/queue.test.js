const IQueue = require("../../src/interfaces/queue");
const QueueService = require("../../src/lib/queue");
const testQueueService = new IQueue(new QueueService());
const faker = require("faker");


test("Should be able to add a new entry to the queue", async() => {
    await testQueueService.enqueue({id: "foo", value: "bar"});
    const queueSize = await testQueueService.size();
    expect(queueSize === 1).toBe(true);
});


test("Should be able to remove an existing entry from the queue", async() => {
    const anotherTestQueueService = new IQueue(new QueueService());
    const firstId = faker.lorem.word();

    await anotherTestQueueService.enqueue({
        id: firstId, 
        value: faker.lorem.word()
    });
    await anotherTestQueueService.enqueue({
        id: faker.lorem.word(), 
        value: faker.lorem.word()
    });

    const item = await anotherTestQueueService.dequeue();

    expect(item.id === firstId).toBe(true);
});


test("Should be able to get the current size of the queue", async() => {
    await testQueueService.enqueue({
        id: faker.lorem.word(), 
        value: faker.lorem.word()
    });

    const queueSize = await testQueueService.size();

    expect(typeof(queueSize) === "number").toBe(true);
});


test("Should be able to verify the existence of an item in the queue", async() => {
    const itemId = faker.lorem.word();
    await testQueueService.enqueue({
        id: itemId,
        value: faker.lorem.word()
    });

    const res = await testQueueService.contains((currentQueue) => {
        return currentQueue.find((item) => item.id === itemId)
    });

    expect(res).toBeTruthy();
});