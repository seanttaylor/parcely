const $ = document.querySelector.bind(document);
/**
 * @param {Object} sidebar - object containing DOM element references comprising the UI sidebar
 */
function sidebarAPI(sidebar) {
  return {
    updateCrateList(crateIds) {
      const update = crateIds.map((id) => `<option value="${id}" data-crate-id=${id}>${id}</option>`).join(',');

      $('#crate-list').disabled = false;
      $('#crate-list').innerHTML = update;
    },
    updateSimulationList(simulation) {
      const update = `<option data-sim-id=${simulation.id} data-sim-name=${simulation.name} value="${simulation.name}">${simulation.name}</option>`;
      $('#simulation-selector').insertAdjacentHTML('beforeend', update);
    },
    getSelectedSimulationId(value) {
      return $(`option[data-sim-name="${value}"]`).dataset.simId;
    },
    getSelectedCrateId(value) {
      return $(`option[data-crate-id="${value}"]`).dataset.crateId;
    },
    setStatus(status) {
      if (status === 'notStarted') {
        sidebar.startSimButton.node.removeAttribute('disabled');
      }

      if (status === 'running') {
        sidebar.startSimButton.node.setAttribute('disabled', true);
        sidebar.stopSimButton.node.removeAttribute('disabled');
      }

      if (status === 'ended') {
        sidebar.stopSimButton.node.setAttribute('disabled', false);
        sidebar.startSimButton.node.setAttribute('disabled', false);
      }

      if (status === 'n/a') {
        sidebar.crateList.node.setAttribute('disabled', true);
        sidebar.startSimButton.node.setAttribute('disabled', true);
      }

      // eslint-disable-next-line
      sidebar.status.node.value = status;
    },
  };
}

const dom = {
  root: {
    selector: 'body',
    node: $('body'),
  },
  uiHandle: {
    selector: '#parcely',
    node: $('#parcely'),
  },
  simulationSelector: {
    selector: '#simulation-selector',
    node: $('#simulation-selector'),
  },
  sidebar: {
    api: null,
    id: {
      selector: '#simulation-id',
      node: $('#simulation-id'),
    },
    createdDate: {
      selector: '#created-date',
      node: $('#created-date'),
    },
    crateList: {
      selector: '#crate-list',
      node: $('#crate-list'),
    },
    status: {
      selector: '#status',
      node: $('#status'),
    },
    instanceCount: {
      selector: '#instance-count',
      node: $('#instance-count'),
    },
    startSimButton: {
      selector: '#start-simulation-button',
      node: $('#start-simulation-button'),
    },
    stopSimButton: {
      selector: '#stop-simulation-button',
      node: $('#stop-simulation-button'),
    },
  },
  createSimButton: {
    selector: '#create-sim-button',
    node: $('#create-sim-button'),
  },
  modal: {
    api: {
      open() {
        $('#modal').classList.add('is-active');
      },
      close() {
        $('#modal').classList.remove('is-active');
      },
    },
    closeButton: {
      selector: '#modal-close-button',
      node: $('#modal-close-button'),
    },
    createButton: {
      selector: '#create-button',
      node: $('#create-button'),
    },
    instanceSelector: {
      selector: '#instance-selector',
      node: $('#instance-selector'),
    },
    intervalMillis: {
      selector: '#interval-millis',
      node: $('#interval-millis'),
    },
    selector: $('#modal'),
    node: $('#modal'),
  },
  emptyState: {
    selector: '#empty-state',
    node: $('#empty-state'),
  },
  simulationViewer: {
    api: {
      displayEmptyState(displayState) {
        $('#empty-state').style.visibility = displayState ? 'initial' : 'hidden';
      },
      displayMap(displayState) {
        $('#map').style.display = displayState ? 'block' : 'none';
      },
    },
    selector: '#simulation-viewer',
    node: $('#simulation-viewer'),
  },
};
const { sidebar } = dom;

dom.sidebar.api = sidebarAPI(sidebar);

export default dom;
