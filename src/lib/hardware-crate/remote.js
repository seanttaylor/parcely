/* istanbul ignore file */
// This file is ignored in testing because it contains only calls to an external API, which we do not want to test
const fetch = require('node-fetch');

/**
 * Manages deployed hardware crates
 * @param {Object} config - application config object
 */

function RemoteHardwareCrateService(config) {
  const PARCELY_HW_API_URL = config.environment.get('PARCELY_HW_API_URL');
  /**
   * Returns the status of a specified hardware crate
   * @param {String} crateId - uuid for a hardware crate
   * @returns {Object}
  */

  this.getCrateStatus = async function (crateId) {
    const response = await fetch(`${PARCELY_HW_API_URL}/api/v1/hw-crates/${crateId}/status`, {
      method: 'GET',
      headers: {
        'x-api-key': 'fooBar',
      },
    });

    if (response.status > 300) {
      return { ready: false };
    }
    const responseJSON = await response.json();
    const [hardwareCrateData] = responseJSON.entries;

    return hardwareCrateData;
  };

  /**
   * Sends command to specified hardware crate to begin pushing telemetry data
   * @param {Crate} crate - an instance of of Crate
   * @returns {Object}
  */

  this.activateCrate = async function (crate) {
    const response = await fetch(`${PARCELY_HW_API_URL}/api/v1/hw-crates/${crate.id}/activate`, {
      method: 'POST',
      headers: {
        'x-api-key': 'fooBar',
        'content-type': 'application/json',
      },
      body: JSON.stringify(crate),
    });

    if (response.status > 300) {
      throw Error(`HardwareCrateServiceError.CannotActivateHardwareCrate => ${response.statusText}`);
    }

    return response.json();
  };
}

module.exports = RemoteHardwareCrateService;
