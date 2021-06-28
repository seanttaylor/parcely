import dom from './dom.js';
import MapServiceAPI from './map.js';
import SimulationServiceAPI from './simulator.js';

function Application() {
  const $ = document.querySelector.bind(document);
  const app = {};
  app.state = {
    simulations: {
      default: {
        id: 'n/a',
        name: 'default',
        createdDate: 'n/a',
        crateIds: ['---'],
        instances: [],
        routeAssignments: {},
        status: 'n/a',
        instanceCount: 0,
      },
    },
  };
  app.config = {};

  function onTelemetryEvent(e) {
    const { header, payload } = JSON.parse(e.data);
    console.log({ header, payload });
    const { crateId } = payload;
    const render = crateId === app.state.currentCrate;

    app.mapServiceAPI.addMarker(payload, { render });
  }

  /*
  function getSimulationByCrateId(crateId) {
    return Object.values(app.state.simulations).find((sim) => sim.crateIds.includes(crateId));
  }
  */

  function onSelectSimulation(e) {
    const { value } = e.target;
    const simulationId = dom.sidebar.api.getSelectedSimulationId(value);
    setCurrentSimulation(simulationId);
  }

  function onSelectCrate(e) {
    const { value } = e.target;
    const crateId = dom.sidebar.api.getSelectedCrateId(value);
    const prevSelectedCrate = app.state.currentCrate;
    app.mapServiceAPI.changeDisplayedMapMarkers({
      from: prevSelectedCrate,
      to: crateId,
    });
    app.state.currentCrate = crateId;
  }

  function onClickCreateSimulation() {
    dom.modal.api.open();
  }

  async function onClickStop(e) {
    e.preventDefault();
    const simulationId = dom.sidebar.id.node.value;
    // Will ultimately be Parcely.SimulatorService.stop();
    await app.simulationServiceAPI.stop(simulationId);
    app.state.simulations[simulationId].status = 'ended';
    dom.sidebar.api.setStatus('ended');
  }

  async function onClickStart(e) {
    e.preventDefault();
    const simulationId = dom.sidebar.id.node.value;
    // Will ultimately be Parcely.SimulatorService.start();
    await app.simulationServiceAPI.start(simulationId);
    app.state.simulations[simulationId].status = 'running';
    dom.sidebar.api.setStatus('running');
    app.mapServiceAPI.createMap();
    dom.simulationViewer.api.displayEmptyState(false);
    dom.simulationViewer.api.displayMap(true);
  }

  async function onClickCreate() {
    const simulationConfig = {
      instanceCount: dom.modal.instanceSelector.node.value,
      intervalMillis: dom.modal.intervalMillis.node.value,
    };

    try {
      // Will ultimately be Parcely.SimulatorService.create();
      const { sidebar, simulationViewer, modal } = dom;
      const simulationRequest = await app.simulationServiceAPI.create(simulationConfig);
      const { entries } = await simulationRequest.json();
      const [simulation] = entries;
      app.state.simulations[simulation.id] = simulation;

      sidebar.api.updateSimulationList(simulation);
      simulationViewer.api.displayEmptyState(false);
      setCurrentSimulation(simulation.id);
      modal.api.close();
    } catch (e) {
      console.error('CannotCreateSimulation:', e);
    }
  }

  function onClickCloseModalButton() {
    dom.modal.api.close();
  }

  function setCurrentSimulation(simulationId) {
    const { sidebar, simulationSelector, simulationViewer } = dom;
    const { name } = app.state.simulations[simulationId];
    const { status } = app.state.simulations[simulationId];
    const currentSimulation = app.state.simulations[simulationId];

    app.state.currentSimulation = currentSimulation.id;
    sidebar.id.node.value = simulationId;
    sidebar.createdDate.node.value = currentSimulation.createdDate;
    sidebar.status.node.value = currentSimulation.status;
    sidebar.instanceCount.node.value = currentSimulation.instanceCount;

    const [crateId] = currentSimulation.crateIds;
    app.state.currentCrate = crateId;
    sidebar.api.updateCrateList(currentSimulation.crateIds);
    simulationSelector.node.selectedOptions[0].removeAttribute('selected');
    simulationViewer.api.displayEmptyState(false);
    $(`${simulationSelector.selector} [data-sim-name=${name}]`).setAttribute('selected', true);

    sidebar.api.setStatus(status);
  }

  function initializeAppState() {
    let crates = [];
    const simulations = JSON.parse($('#data-block').innerHTML)
      .reduce((res, sim) => {
        res[sim.id] = sim;
        crates = [...crates, ...sim.crateIds];
        return res;
      }, {});

    return {
      simulations,
      crates,
    };
  }

  async function init() {
    const sse = new EventSource('/api/v1/crates/telemetry/rt-updates/subscribe');
    const {
      simulationSelector,
      createSimButton,
      modal,
      sidebar,
    } = dom;

    app.state = { ...initializeAppState() };

    app.simulationServiceAPI = new SimulationServiceAPI();
    app.mapServiceAPI = new MapServiceAPI(app.state.crates).init({
      key: 'AIzaSyAlatZKpqnAj7Oh-Z527T6QMnbzq_kFoXg',
    });
    app.config.sse = sse;

    sse.addEventListener('CrateTelemetryUpdateReceived', onTelemetryEvent);

    simulationSelector.node.addEventListener('change', onSelectSimulation);
    createSimButton.node.addEventListener('click', onClickCreateSimulation);

    modal.closeButton.node.addEventListener('click', onClickCloseModalButton);
    modal.createButton.node.addEventListener('click', onClickCreate);

    sidebar.startSimButton.node.addEventListener('click', onClickStart);
    sidebar.stopSimButton.node.addEventListener('click', onClickStop);
    sidebar.crateList.node.addEventListener('change', onSelectCrate);

    console.log('✅ Application initialized');
  }

  return { init };
}

(async function () {
  try {
    await Application().init();
  } catch (e) {
    console.error(e);
  }
}());
