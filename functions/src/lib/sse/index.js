const uuid = require('uuid');

function ServerSentEvent() {
  /**
    Creates a string complying with the Event Stream format for pushing Server-Sent Events to connected clients
    See https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format for more info
    @param {String} eventName - name of the event
    @param {Object} eventData - the data about the event to send
    @returns {Array}
    */
  function of(eventName, eventData = {}) {
    return [
      `event: ${eventName}\n\n`,
      `data: ${JSON.stringify({
        header: {
          timestamp: new Date().toISOString(),
          name: eventName,
          uuid: uuid.v4(),
        },
        payload: eventData,
      })}\n`,
    ];
  }

  return { of };
}

module.exports = ServerSentEvent;
