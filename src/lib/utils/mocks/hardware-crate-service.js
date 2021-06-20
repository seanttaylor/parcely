const crateStatus = {
  applicationVersion: '0.0.1',
  versionHash: '13626a216c8a4b38079d91a3750fa6c435adb0dd',
  name: 'omnipotent-octopus',
  id: 'null',
  diagnostics: {
    sensors: {
      photometer: {
        lastAccessTime: '2021-02-24T19:04:33.436344',
        status: [
          'ok',
        ],
      },
      thermometer: {
        lastAccessTime: '2021-02-24T19:04:33.436344',
        status: [
          'ok',
        ],
      },
      moisture: {
        lastAccessTime: '2021-02-24T19:04:33.436344',
        status: [
          'ok',
        ],
      },
    },
  },
  status: {
    device: [
      'ok',
    ],
    application: [
      'ok',
    ],
  },
  ready: true,
};

/**
 * Mock implementation for various HardwareCrateService methods
 * See /src/interfaces/hardware-crate for documentation
 */
const mockHardwareCrateServiceImplementation = {
  getCrateStatus(crateId) {
    return Object.assign(crateStatus, { id: crateId });
  },
  activateCrate(crate) {
    const shipmentReceipt = {
      date: new Date().toISOString(),
      crateId: crate.id,
    };
    return shipmentReceipt;
  },
};

module.exports = mockHardwareCrateServiceImplementation;
