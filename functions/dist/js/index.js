function Application() {
  const app = {};
  app.config = {};
  app.config.dom = {
    root: {
      selector: 'body',
      node: document.querySelector('body'),
    },
    uiHandle: {
      selector: '#parcely',
      node: document.querySelector('#parcely'),
    },
  };

  function onTelemetry(e) {
    console.log(JSON.parse(e.data));
  }

  async function init() {
    console.log('Parcely | Simple real-time logistics');
    console.info('INITIALIZING');
    const source = new EventSource('/api/v1/crates/telemetry/rt-updates/subscribe');
    app.config.source = source;

    source.addEventListener('SSEPublisher.TelemetryUpdateReceived', onTelemetry);
  }

  return { init };
}

(async function $() {
  try {
    await Application().init();
  } catch (e) {
    console.error(e);
  }
}());
