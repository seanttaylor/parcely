/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';
const supertest = require('supertest');
const app = require('../../app.index');
const furyEmailAddress = 'nfury@shield.gov';
const superSecretPassword = 'superSecretPassword';

const request = supertest(app);

describe('ShipmentSimulator', () => {
  test('Should be able to create a new simulation', async () => {
    const res0 = await request.post('/api/v1/users/token')
    .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword
    })
    .expect(201);

    const furyAccessToken = res0.body.accessToken;

    const res1 = await request.post('/api/v1/simulations')
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send({
        instanceCount: 5
    })
    .expect(201);

    expect(res1.body.entries[0].status === 'notStarted').toBe(true);
    expect(res1.body.entries[0].instanceCount === 5).toBe(true);
    expect(res1.body.entries[0].id).toBeTruthy();
  });

  test('Should be able to start an existing simulation', async () => {
    const res0 = await request.post('/api/v1/users/token')
    .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword
    })
    .expect(201);

    const furyAccessToken = res0.body.accessToken;

    const res1 = await request.post('/api/v1/simulations')
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send({
        instanceCount: 5,
    })
    .expect(201);

    const simulationId = res1.body.entries[0].id;

    expect(res1.body.entries[0].status === 'notStarted').toBe(true);
    expect(res1.body.entries[0].instanceCount === 5).toBe(true);
    expect(res1.body.entries[0].id).toBeTruthy();

    const res2 = await request.post(`/api/v1/simulations/${simulationId}/start`)
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send()
    .expect(204);

    const res3 = await request.get(`/api/v1/simulations/${simulationId}`)
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send()
    .expect(200);
     
    expect(res3.body.entries[0].status === 'running').toBe(true);
  });

  test('Should be able to end an existing simulation', async () => {
    const res0 = await request.post('/api/v1/users/token')
    .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword
    })
    .expect(201);

    const furyAccessToken = res0.body.accessToken;

    const res1 = await request.post('/api/v1/simulations')
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send({
        instanceCount: 5,
    })
    .expect(201);

    const simulationId = res1.body.entries[0].id;

    expect(res1.body.entries[0].status === 'notStarted').toBe(true);
    expect(res1.body.entries[0].instanceCount === 5).toBe(true);
    expect(res1.body.entries[0].id).toBeTruthy();

    const res2 = await request.post(`/api/v1/simulations/${simulationId}/start`)
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send()
    .expect(204);

    const res3 = await request.get(`/api/v1/simulations/${simulationId}`)
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send()
    .expect(200);
     
    expect(res3.body.entries[0].status === 'running').toBe(true);

    const res4 = await request.post(`/api/v1/simulations/${simulationId}/end`)
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send()
    .expect(204);

    const res5 = await request.get(`/api/v1/simulations/${simulationId}`)
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send()
    .expect(200);
     
    expect(res5.body.entries[0].status === 'ended').toBe(true);
  });

  test('Should return HTTP status (404) on requests for non-existing simulations', async () => {
    const res0 = await request.post('/api/v1/users/token')
    .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword
    })
    .expect(201);

    const furyAccessToken = res0.body.accessToken;

    const res1 = await request.post('/api/v1/simulations')
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send({
        instanceCount: 5,
    })
    .expect(201);

    expect(res1.body.entries[0].status === 'notStarted').toBe(true);
    expect(res1.body.entries[0].instanceCount === 5).toBe(true);
    expect(res1.body.entries[0].id).toBeTruthy();

    const res2 = await request.get(`/api/v1/simulations/foo`)
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send()
    .expect(404);
  });

  test('Should return HTTP status (404) on requests to start non-existing simulations', async () => {
    const res0 = await request.post('/api/v1/users/token')
    .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword
    })
    .expect(201);

    const furyAccessToken = res0.body.accessToken;

    const res1 = await request.post('/api/v1/simulations')
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send({
        instanceCount: 5,
    })
    .expect(201);

    expect(res1.body.entries[0].status === 'notStarted').toBe(true);
    expect(res1.body.entries[0].instanceCount === 5).toBe(true);
    expect(res1.body.entries[0].id).toBeTruthy();

    const res2 = await request.get(`/api/v1/simulations/foo/start`)
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send()
    .expect(404);
  });
});
