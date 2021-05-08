/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';

const app = require('../../app.index');
const supertest = require('supertest');

const request = supertest(app);
const faker = require('faker');

describe('Authorization', () => {
  test('Platform should reject API requests that do not contain an authorization token', async () => {
    const res1 = await request.get('/api/v1/users/e98417a8-d912-44e0-8d37-abe712ca840f')
      .send()
      .expect(401);
  });

  test('Platform accept API requests that contain a valid X-API-Key header', async () => {
    const res1 = await request.get('/api/v1/users/e98417a8-d912-44e0-8d37-abe712ca840f')
      .set('X-API-Key', 'fakeAPIKey')
      .send()
      .expect(200);
  });
});
