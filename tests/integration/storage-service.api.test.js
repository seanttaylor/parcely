/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';
const faker = require('faker');
const supertest = require('supertest');
const app = require('../../app.index');
const request = supertest(app);
const furyEmailAddress = 'nfury@shield.gov';
const superSecretPassword = 'superSecretPassword';


describe('StorageAPI', () => {
  test('Should be able to get a list of storage buckets', async () => {
    const res1 = await request.post('/api/v1/users/token')
    .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword,
    })
    .expect(201);
    
    const furyAccessToken = res1.body.accessToken;

    const res2 = await request.get('/storage/buckets')
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send()
    .expect(200);

    expect(Array.isArray(res2.body.entries)).toBe(true);
  });

  test('Should be able to get a specified storage bucket', async () => {
    const bucketId = 'crate-qr-codes';

    const res1 = await request.post('/api/v1/users/token')
    .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword,
    })
    .expect(201);
    
    const furyAccessToken = res1.body.accessToken;

    const res2 = await request.get(`/storage/buckets/${bucketId}`)
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send()
    .expect(200);

    expect(Array.isArray(res2.body.entries)).toBe(true);
  });

  test('Should be able to get a specified storage bucket item', async () => {
    const bucketId = 'crate-qr-codes';

    const res1 = await request.post('/api/v1/users/token')
    .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword,
    })
    .expect(201);
    
    const furyAccessToken = res1.body.accessToken;

    await request.post('/api/v1/crates')
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send({
        size: ['L'],
        merchantId: faker.datatype.uuid(),
    })
    .expect(201);

    const res2 = await request.get(`/storage/buckets/${bucketId}`)
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send()
    .expect(200);

    const [bucketItemId] = res2.body.entries;

    await request.get(`/storage/buckets/${bucketId}/${bucketItemId}`)
    .send()
    .expect(200);
  });

  test('Non-admin users should NOT be able to storage bucket resources ', async () => {
       
    await request.get('/storage/buckets')
    .send()
    .expect(401);
  });

  test('Should receive 404 status when requesting a non-existent bucket item', async () => {
    const bucketId = 'crate-qr-codes';

    const res1 = await request.post('/api/v1/users/token')
    .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword,
    })
    .expect(201);
    
    const furyAccessToken = res1.body.accessToken;

    const res2 = await request.get(`/storage/buckets/crate-qr-codes/dontexist`)
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send()
    .expect(404);
  });

  test('Should receive 404 status when requesting a non-existent bucket', async () => {
    const bucketId = 'crate-qr-codes';

    const res1 = await request.post('/api/v1/users/token')
    .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword,
    })
    .expect(201);
    
    const furyAccessToken = res1.body.accessToken;

    const res2 = await request.get(`/storage/buckets/dontexist`)
    .set('authorization', `Bearer ${furyAccessToken}`)
    .send()
    .expect(404);
  });
});