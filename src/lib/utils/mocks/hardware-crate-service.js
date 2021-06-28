const crateStatus = {
  applicationVersion: '0.0.1',
  versionHash: '13626a216c8a4b38079d91a3750fa6c435adb0dd',
  name: 'evergreen-egret',
  id: '2c3846c8-a429-4765-854b-2283eaa8885b',
  diagnostics: {
    sensors: {
      photometer: {
        lastAccessTime: '2021-02-24T19:04:33.436344',
        status: {
          hasFault: [
            true,
          ],
        },
      },
      thermometer: {
        lastAccessTime: '2021-02-24T19:04:33.436344',
        status: {
          hasFault: [
            true,
          ],
        },
      },
      moisture: {
        lastAccessTime: '2021-02-24T19:04:33.436344',
        status: {
          hasFault: [
            false,
          ],
        },
      },
    },
  },
  status: {
    device: {
      hasFault: [
        true,
      ],
    },
    application: {
      hasFault: [
        false,
      ],
    },
  },
  ready: [
    true,
  ],
};

/**
 * Mock implementation for various HardwareCrateService methods
 * See /src/interfaces/hardware-crate for documentation
 */
const mockHardwareCrateServiceImplementation = {
  getCrateStatus(crateId) {
    return Object.assign(crateStatus, { id: crateId });
  },
  activateCrate(crateId) {
    const shipmentReceipt = {
      createdDate: new Date().toISOString(),
      crateId,
    };
    return shipmentReceipt;
  },
  async registerCrate() {
    // Goes nowhere does nothing
  },
};

module.exports = mockHardwareCrateServiceImplementation;
