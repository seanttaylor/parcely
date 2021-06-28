/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';
const faker = require('faker');
const IHardwareCrateService  = require('../../src/interfaces/hardware-crate');
const {mockImpl} = require('../../src/lib/utils/mocks');
const hardwareCrateService = new IHardwareCrateService(mockImpl.hardwareCrateService);

test('Should be able to get a diagnostic report (i.e. status) of a specified hardware crate', async () => {
  const testCrateId = faker.datatype.uuid();
  const crateReport = await hardwareCrateService.getCrateStatus(testCrateId);
  expect(typeof crateReport === 'object').toBe(true);
  expect(crateReport.ready[0]).toBe(true);
});

test('Should be able to get receipt indicating a hardware crate has started shipment', async () => {
  const mockCrateId = 'foobar';
  const response = await hardwareCrateService.activateCrate(mockCrateId);
  expect(typeof response === 'object').toBe(true);
  expect(response.crateId === mockCrateId).toBe(true);
  expect(response.createdDate).toBeTruthy();
});

