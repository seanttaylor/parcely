/**
 *
 * @param {Array} crates - list of all crateIds for all simulations
 * @returns {Object}
 */
function MapServiceAPI(crates) {
  // eslint rule disabled because google namespace is global
  /* eslint-disable no-undef */
  let map;
  const crateMarkerMap = crates.reduce((res, crateId) => {
    res[crateId] = [];
    return res;
  }, {});

  function getMap() {
    return map;
  }

  function addMarker(payload, { render } = {}) {
    const { crateId } = payload;
    const { coords } = payload.telemetry.location;
    const marker = new google.maps.Marker({
      position: coords,
      animation: google.maps.Animation.DROP,
    });
    const contentString = `<div class="card">
    <div class="card-content">
      <div class="content">
        <p><strong>Location</strong>: ${coords.lat}, ${coords.lng}</p>
        <p><strong>Temp</strong>: ${payload.telemetry.temp.degreesFahrenheit}</p>
        <p><strong>Timestamp</strong>: ${payload.timestamp}</p>
        <p><strong>URL</strong>: <a href="/api/v1/crates/${crateId}">
            /api/v1/crates/${crateId}
            </a>
        </p>
       <p
      </div>
    </div>
  </div>`;
    const infoWindow = new google.maps.InfoWindow({
      content: contentString,
    });
    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    if (render) {
      marker.setMap(map);
    }

    if (crateMarkerMap[crateId]) {
      crateMarkerMap[crateId].push(marker);
      return;
    }
    crateMarkerMap[crateId] = [];
    crateMarkerMap[crateId].push(marker);
  }

  function createMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat: 41.878100,
        lng: -87.629800,
      },
      streetViewControl: false,
      mapTypeControl: false,
      zoom: 4,
    });
  }

  function changeDisplayedMapMarkers({ from, to }) {
    crateMarkerMap[from].forEach((marker) => {
      marker.setMap(null);
    });

    // Will only be executed if we have received at least (1) telemetry update from crateId in the `to` parameter
    if (crateMarkerMap[to]) {
      crateMarkerMap[to].forEach((marker) => {
        marker.setMap(map);
      });
    }
  }

  function init({ key }) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap`;
    script.async = true;

    window.initMap = function () {
      console.log('✅ MapService initialized');
    };

    document.head.appendChild(script);
    return {
      getMap, addMarker, createMap, changeDisplayedMapMarkers,
    };
  }

  return { init };
  /* eslint-disable no-undef */
}

export default MapServiceAPI;
