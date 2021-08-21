/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';

const app = require('../../index');
const supertest = require('supertest');

const request = supertest(app);
const faker = require('faker');

const starkUserId = 'e98417a8-d912-44e0-8d37-abe712ca840f';
const starkEmailAddress = 'tstark@avengers.io';
const starkMerchantId = 'dd8b20dd-1637-4396-bba5-bcd6d65e2d5d';
const furyUserId = '5298b9ab-9493-4fee-bf7e-805e47bb5d42';
const furyEmailAddress = 'nfury@shield.gov';
const thorUserId = 'b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09';
const thorEmailAddress = 'thor@avengers.io';
const superSecretPassword = 'superSecretPassword';
const defaultPlan = {
  planType: ['smallBusiness'],
  startDate: '01/01/2021',
  expiryDate: '01/01/2022',
  status: [
    'active',
  ],
  autoRenew: true,
};

describe('MerchantManagement', () => {
  test('Admins should be able to create a new merchant', async () => {
    const res1 = await request.post('/api/v1/users/token')
      .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword,
      })
      .expect(201);

    const furyAccessToken = res1.body.accessToken;

    const testMerchantData = {
      name: faker.company.companyName(),
      userId: thorUserId,
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };

    const res2 = await request.post('/api/v1/merchants')
      .set('authorization', `Bearer ${furyAccessToken}`)
      .send(testMerchantData)
      .expect(201);

    expect(Array.isArray(res2.body.entries)).toBe(true);
    expect(res2.body.count === 1).toBe(true);
    expect(Object.keys(res2.body.entries[0]).includes('id')).toBe(true);
  });

  test('Merchants should be able update their own plan', async () => {
    const fakePassword = faker.internet.password();
    const fakeEmailAddress = faker.internet.email();

    const res = await request.post('/api/v1/users')
      .send({
        emailAddress: fakeEmailAddress,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        phoneNumber: faker.phone.phoneNumber(),
        password: fakePassword,
      })
      .expect(201);

    const fakeUserId = res.body.userId;

    const res1 = await request.post('/api/v1/users/token')
      .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword,
      })
      .expect(201);

    const furyAccessToken = res1.body.accessToken;
    const fakeAccessToken = res.body.accessToken;

    const testMerchantData = {
      name: faker.company.companyName(),
      userId: fakeUserId,
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };

    const res3 = await request.post('/api/v1/merchants')
      .set('authorization', `Bearer ${furyAccessToken}`)
      .send(testMerchantData)
      .expect(201);

    const merchantId = res3.body.entries[0].id;

    const res4 = await request.put(`/api/v1/merchants/${merchantId}/plan`)
      .set('authorization', `Bearer ${fakeAccessToken}`)
      .send({
        planType: ['enterprise'],
        startDate: '01/01/2021',
        expiryDate: '01/01/2022',
        status: [
          'active',
        ],
        autoRenew: true,
      })
      .expect(204);

    const res5 = await request.get(`/api/v1/merchants/${merchantId}`)
      .set('authorization', `Bearer ${fakeAccessToken}`)
      .send()
      .expect(200);

    expect(Array.isArray(res5.body.entries)).toBe(true);
    expect(res5.body.count === 1).toBe(true);
    expect(res5.body.entries[0].id === merchantId).toBe(true);
    expect(res5.body.entries[0].data.plan.planType[0] === 'enterprise').toBe(true);
  });

  test('Admins should NOT be able to create a new merchant for a userId that does not exist', async () => {
    const res1 = await request.post('/api/v1/users/token')
      .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword,
      })
      .expect(201);

    const furyAccessToken = res1.body.accessToken;

    const testMerchantData = {
      name: faker.company.companyName(),
      userId: faker.datatype.uuid(),
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };

    const res2 = await request.post('/api/v1/merchants')
      .set('authorization', `Bearer ${furyAccessToken}`)
      .send(testMerchantData)
      .expect(400);

    expect(Array.isArray(res2.body.entries)).toBe(true);
    expect(res2.body.count === 0).toBe(true);
    expect(res2.body.error).toBeTruthy();
    expect(res2.body.error).toMatch('MerchantServiceError.CannotCreateMerchant.BadRequest.UserDoesNotExist');
  });

  test('Admins should NOT be able to create a new merchant for a user that already has a merchant account', async () => {
    const res1 = await request.post('/api/v1/users/token')
      .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword,
      })
      .expect(201);

    const furyAccessToken = res1.body.accessToken;

    const testMerchantData = {
      name: faker.company.companyName(),
      userId: thorUserId,
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };

    const res2 = await request.post('/api/v1/merchants')
      .set('authorization', `Bearer ${furyAccessToken}`)
      .send(testMerchantData)
      .expect(400);

    expect(Array.isArray(res2.body.entries)).toBe(true);
    expect(res2.body.count === 0).toBe(true);
    expect(res2.body.error).toBeTruthy();
    expect(res2.body.error).toMatch('MerchantServiceError.CannotCreateMerchant.BadRequest.UserIsAlreadyMerchant');
  });

  test('Merchants should be able to cancel their own plan', async () => {
    const fakePassword = faker.internet.password();
    const fakeEmailAddress = faker.internet.email();

    const res = await request.post('/api/v1/users')
      .send({
        emailAddress: fakeEmailAddress,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        phoneNumber: faker.phone.phoneNumber(),
        password: fakePassword,
      })
      .expect(201);

    const fakeUserId = res.body.userId;

    const res1 = await request.post('/api/v1/users/token')
      .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword,
      })
      .expect(201);

    const furyAccessToken = res1.body.accessToken;
    const fakeAccessToken = res.body.accessToken;

    const testMerchantData = {
      name: faker.company.companyName(),
      userId: fakeUserId,
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };

    const res3 = await request.post('/api/v1/merchants')
      .set('authorization', `Bearer ${furyAccessToken}`)
      .send(testMerchantData)
      .expect(201);

    const merchantId = res3.body.entries[0].id;

    const res4 = await request.post(`/api/v1/merchants/${merchantId}/plan/cancel`)
      .set('authorization', `Bearer ${fakeAccessToken}`)
      .send()
      .expect(204);

    const res5 = await request.get(`/api/v1/merchants/${merchantId}`)
      .set('authorization', `Bearer ${fakeAccessToken}`)
      .send()
      .expect(200);

    expect(Array.isArray(res5.body.entries)).toBe(true);
    expect(res5.body.count === 1).toBe(true);
    expect(res5.body.entries[0].id === merchantId).toBe(true);
    expect(res5.body.entries[0].data.plan.status[0] === 'cancelled').toBe(true);
    expect(res5.body.entries[0].data.plan.autoRenew === false).toBe(true);
  });

  test('Admins should be able to archive a specified merchant', async () => {
    const fakePassword = faker.internet.password();
    const fakeEmailAddress = faker.internet.email();

    const res = await request.post('/api/v1/users')
      .send({
        emailAddress: fakeEmailAddress,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        phoneNumber: faker.phone.phoneNumber(),
        password: fakePassword,
      })
      .expect(201);

    const fakeUserId = res.body.userId;

    const res1 = await request.post('/api/v1/users/token')
      .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword,
      })
      .expect(201);

    const furyAccessToken = res1.body.accessToken;
    const fakeAccessToken = res.body.accessToken;

    const testMerchantData = {
      name: faker.company.companyName(),
      userId: fakeUserId,
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };

    const res3 = await request.post('/api/v1/merchants')
      .set('authorization', `Bearer ${furyAccessToken}`)
      .send(testMerchantData)
      .expect(201);

    const merchantId = res3.body.entries[0].id;

    const res4 = await request.post(`/api/v1/merchants/${merchantId}/status/archived`)
      .set('authorization', `Bearer ${furyAccessToken}`)
      .send()
      .expect(204);

    const res5 = await request.get(`/api/v1/merchants/${merchantId}`)
      .set('authorization', `Bearer ${fakeAccessToken}`)
      .send()
      .expect(200);

    expect(Array.isArray(res5.body.entries)).toBe(true);
    expect(res5.body.count === 1).toBe(true);
    expect(res5.body.entries[0].id === merchantId).toBe(true);
    expect(res5.body.entries[0].data.status[0] === 'archived').toBe(true);
  });

  test('Merchants should be able to get a list of crates associated with their account', async () => {
    const fakePassword = faker.internet.password();
    const fakeEmailAddress = faker.internet.email();

    const res = await request.post('/api/v1/users')
      .send({
        emailAddress: fakeEmailAddress,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        phoneNumber: faker.phone.phoneNumber(),
        password: fakePassword,
      })
      .expect(201);

    const fakeUserId = res.body.userId;

    const res1 = await request.post('/api/v1/users/token')
      .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword,
      })
      .expect(201);

    const furyAccessToken = res1.body.accessToken;
    const fakeAccessToken = res.body.accessToken;

    const testMerchantData = {
      name: faker.company.companyName(),
      userId: fakeUserId,
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };

    const res3 = await request.post('/api/v1/merchants')
      .set('authorization', `Bearer ${furyAccessToken}`)
      .send(testMerchantData)
      .expect(201);

    const merchantId = res3.body.entries[0].id;

    await request.post(`/api/v1/crates`)
      .set('authorization', `Bearer ${furyAccessToken}`)
      .send({
        size: ["L"],
        merchantId
      })
      .expect(201);

    const res5 = await request.get(`/api/v1/merchants/${merchantId}/crates`)
      .set('authorization', `Bearer ${fakeAccessToken}`)
      .send()
      .expect(200);
    
    expect(Array.isArray(res5.body.entries)).toBe(true);
    expect(res5.body.count === 1).toBe(true);
    expect(res5.body.entries[0].data.merchantId === merchantId).toBe(true);
  });

  test('Merchants should be able to get a list of shipments associated with their account', async () => {
    const fakePassword = faker.internet.password();
    const fakeEmailAddress = faker.internet.email();

    const res = await request.post('/api/v1/users')
      .send({
        emailAddress: fakeEmailAddress,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        phoneNumber: faker.phone.phoneNumber(),
        password: fakePassword,
      })
      .expect(201);

    const fakeUserId = res.body.userId;

    const res1 = await request.post('/api/v1/users/token')
      .send({
        emailAddress: furyEmailAddress,
        password: superSecretPassword,
      })
      .expect(201);

    const furyAccessToken = res1.body.accessToken;
    const fakeAccessToken = res.body.accessToken;

    const testMerchantData = {
      name: faker.company.companyName(),
      userId: fakeUserId,
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };

    const res2 = await request.post('/api/v1/merchants')
      .set('authorization', `Bearer ${furyAccessToken}`)
      .send(testMerchantData)
      .expect(201);

    const merchantId = res2.body.entries[0].id;

    const res3 = await request.post('/api/v1/crates')
      .set('authorization', `Bearer ${furyAccessToken}`)
      .send({
        size: ['L'],
        merchantId,
      })
      .expect(201);

    const crateId = res3.body.entries[0].id;

    await request.put(`/api/v1/crates/${crateId}/recipient`)
      .set('authorization', `Bearer ${furyAccessToken}`)
      .send({
        recipientEmail: thorEmailAddress,
      })
      .expect(204);

    await request.post(`/api/v1/crates/${crateId}/shipments`)
      .set('authorization', `Bearer ${furyAccessToken}`)
      .send({
        originAddress: {
          street: faker.address.streetName(),
          apartmentNumber: '7',
          city: faker.address.city(),
          state: faker.address.stateAbbr(),
          zip: faker.address.zipCode(),
        },
        destinationAddress: {
          street: faker.address.streetName(),
          apartmentNumber: '7',
          city: faker.address.city(),
          state: faker.address.stateAbbr(),
          zip: faker.address.zipCode(),
        },
        trackingNumber: faker.datatype.uuid(),
      })
      .expect(201);


    const res5 = await request.get(`/api/v1/merchants/${merchantId}/shipments`)
      .set('authorization', `Bearer ${fakeAccessToken}`)
      .send()
      .expect(200);

    expect(Array.isArray(res5.body.entries)).toBe(true);
    expect(res5.body.count === 1).toBe(true);
    expect(res5.body.entries[0].data.merchantId === merchantId).toBe(true);
  });
});
