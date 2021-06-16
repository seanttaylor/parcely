/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';
const IHardwareCrateService  = require('../../src/interfaces/hardware-crate');
const {mockImpl} = require('../../src/lib/utils/mocks');
const hardwareCrateService = new IHardwareCrateService(mockImpl.hardwareCrateService);

test('Should be able to get a diagnostic report (i.e. status) of a specified hardware crate', async () => {
  const crateReport = await hardwareCrateService.getCrateStatus();
  expect(typeof crateReport === 'object').toBe(true);
  expect(crateReport.ready === true).toBe(true);
});

test('Should be able to get confirmation that a hardware crate has started shipment', async () => {
  const mockCrate = {id: 'foobar'};
  const response = await hardwareCrateService.shipCrate(mockCrate);
  expect(typeof response === 'object').toBe(true);
  expect(response.crateId === mockCrate.id).toBe(true);
  expect(response.date).toBeTruthy();
});

