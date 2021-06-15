export default function SimulationServiceAPI() {
  const baseURL = '/api/v1/simulations';

  this.create = async function ({ intervalMillis, instanceCount }) {
    const response = await fetch(baseURL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': 'KCXC9JD-08M4WGH-M9294W1-B6RTBTH',
      },
      body: JSON.stringify({ intervalMillis, instanceCount }),
    });
    return response;
  };

  this.start = async function (simulationId) {
    const response = await fetch(`${baseURL}/${simulationId}/start`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': 'KCXC9JD-08M4WGH-M9294W1-B6RTBTH',
      },
    });
    return response;
  };

  this.stop = async function (simulationId) {
    const response = await fetch(`${baseURL}/${simulationId}/end`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': 'KCXC9JD-08M4WGH-M9294W1-B6RTBTH',
      },
    });
    return response;
  };
}
