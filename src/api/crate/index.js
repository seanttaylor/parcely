/* istanbul ignore file */
const express = require('express');
const createCrateSchema = require('../../schemas/api/crate/crate.json');
const startCrateShipmentSchema = require('../../schemas/api/crate/shipment.json');
const addShipmentWaypointSchema = require('../../schemas/api/crate/waypoint.json');
const setRecipientSchema = require('../../schemas/api/crate/recipient.json');

const router = new express.Router();
const {
  authorizeRequest,
  validateJWT,
  validateRequest,
} = require('../../lib/middleware');

/**
 * @param {CrateService} crateService - an instance of the CrateService
 * @param {EventEmitter} eventEmitter - an instance of EventEmitter
 * @param {QueueService} queueService - an instance of QueueService
 * @param {PublishService} publishService - an instance of PublishService
 * @param {HardwareCrateService} hardwareCrateService - an instance of HardwareCrateService

 * @returns router - an instance of an Express router
 */

function CrateRouter({
  crateService, queueService, publishService, eventEmitter, hardwareCrateService,
}) {
  // OpenAPI operationId: getAllCrates
  router.get('/', validateJWT, authorizeRequest({ actionId: 'readAny:crates' }), async (req, res, next) => {
    try {
      const crateList = await crateService.getAllCrates();
      res.set('content-type', 'application/json');
      res.status(200);
      res.json({
        entries: crateList.map((c) => c.toJSON()),
        error: null,
        count: crateList.length,
      });
    } catch (e) {
      next(e);
    }
  });

  // OpenAPI operationId: getCrateById
  router.get('/:id', validateJWT, authorizeRequest({ actionId: 'readAny:crates' }), async (req, res, next) => {
    const crateId = req.params.id;

    try {
      const crate = await crateService.getCrateById(crateId);
      res.set('content-type', 'application/json');

      if (!crate) {
        res.status(404);
        res.end();
        return;
      }

      res.status(200);
      res.json({
        entries: [crate],
        error: null,
        count: 1,
      });
    } catch (e) {
      next(e);
    }
  });

  // OpenAPI operationId: createCrate
  router.post('/', validateRequest(createCrateSchema), validateJWT, authorizeRequest({ actionId: 'createAny:crates' }), async (req, res, next) => {
    const crateData = req.body;

    try {
      const crate = await crateService.createCrate(crateData);
      await crate.save();
      res.set('content-type', 'application/json');
      res.status(201);
      res.json({
        entries: [crate.toJSON()],
        error: null,
        count: 1,
      });
    } catch (e) {
      next(e);
    }
  });

  // OpenAPI operationId: deleteCrate
  router.delete('/:id', validateJWT, authorizeRequest({ actionId: 'deleteAny:crates' }), async (req, res, next) => {
    const crateId = req.params.id;

    try {
      await crateService.deleteCrate(crateId);

      res.set('content-type', 'application/json');
      res.status(204);
      res.send();
    } catch (e) {
      next(e);
    }
  });

  // OpenAPI operationId: getShipmentsByCrateId
  router.get('/:id/shipments', validateJWT, authorizeRequest({ actionId: 'readAny:crates' }), async (req, res, next) => {
    const crateId = req.params.id;

    try {
      const crate = await crateService.getCrateById(crateId);
      const shipmentList = await crateService.getShipmentsByCrate(crate);
      res.set('content-type', 'application/json');

      res.status(200);
      res.json({
        entries: shipmentList.map((s) => s.toJSON()),
        error: null,
        count: shipmentList.length,
      });
    } catch (e) {
      next(e);
    }
  });

  // OpenAPI operationId: getCrateShipmentById
  router.get('/:id/shipments/:shipmentId', validateJWT, authorizeRequest({ actionId: 'readOwn:crates', allowResourceOwnerOnly: false }), async (req, res, next) => {
    const { shipmentId } = req.params;
    const { includeWaypoints } = req.query;
    const boolMap = { true: true, false: false };

    try {
      const shipment = await crateService.getCrateShipmentById(shipmentId, { includeWaypoints: boolMap[includeWaypoints] });
      res.set('content-type', 'application/json');

      res.status(200);
      res.json({
        entries: [shipment],
        error: null,
        count: 1,
      });
    } catch (e) {
      next(e);
    }
  });

  // OpenAPI operationId: startCrateShipment
  router.post('/:id/shipments', validateRequest(startCrateShipmentSchema), validateJWT, authorizeRequest({ actionId: 'createAny:crates' }), async (req, res, next) => {
    const crateId = req.params.id;
    const { originAddress, destinationAddress, trackingNumber } = req.body;

    try {
      const crate = await crateService.getCrateById(crateId);
      const { ready: crateReady } = await hardwareCrateService.getCrateStatus(crateId);

      if (!crateReady) {
        res.status(503);
        res.json({
          entries: [],
          error: 'Service Unavailable',
          count: 0,
        });
        return;
      }

      await crate.startShipment({
        originAddress,
        destinationAddress,
        trackingNumber,
      });
      // Maybe hardwareCrateService should be a dependency of CrateService?
      await hardwareCrateService.shipCrate(crate);

      res.set('content-type', 'application/json');
      res.status(201);
      res.json({
        entries: [crate.toJSON()],
        error: null,
        count: 1,
      });
    } catch (e) {
      next(e);
    }
  });

  // DEPRECATED
  // OpenAPI operationId: addShipmentWaypoints
  /*
    router.post("/:id/shipments/:shipmentId/waypoints", validateRequest(addShipmentWaypointSchema), validateJWT, authorizeRequest({actionId: "createAny:crates"}), async function addShipmentWaypoint(req, res, next) {
        const crateId = req.params.id;
        const telemetry = req.body;

        try {
            const crate = await crateService.getCrateById(crateId);
            await crate.currentTrip.addWaypoint({telemetry});
            res.set("content-type", "application/json");
            res.status(201);
            res.json({
                entries: [crate.toJSON()],
                error: null,
                count: 1
            });
        }
        catch (e) {
            next(e);
        }
    });
    */

  // OpenAPI operationId: subscribeToRealtimeUpdates
  router.get('/telemetry/rt-updates/subscribe', async (req, res) => {
    res.status(200).set({
      connection: 'keep-alive',
      'cache-control': 'no-cache',
      'content-type': 'text/event-stream',
    });

    // An initial OK response must be sent clients to establish a connection
    res.write('data: CONNECTION_OK \n\n');
    publishService.init(([eventName, eventData]) => {
      res.write(eventData);
      res.write(eventName);
    });
  });

  // OpenAPI operationId: receiveRealtimeUpdate
  router.post('/telemetry/rt-updates', validateRequest(addShipmentWaypointSchema), validateJWT, authorizeRequest({ actionId: 'updateAny:crates' }), async (req, res, next) => {
    const { crateId, telemetry } = req.body;

    try {
      res.set('content-type', 'application/json');
      await queueService.enqueue({ crateId, telemetry });
      eventEmitter.emit('CrateAPI.QueueService.TelemetryUpdateReceived');
      res.status(204);
      res.send();
    } catch (e) {
      next(e);
    }
  });

  // OpenAPI operationId: completeCrateShipment
  router.post('/:id/shipments/:shipmentId/status/complete', validateJWT, authorizeRequest({ actionId: 'updateAny:crates' }), async (req, res, next) => {
    const crateId = req.params.id;

    try {
      const crate = await crateService.getCrateById(crateId);
      await crate.completeShipment();
      res.status(204);
      res.send();
    } catch (e) {
      next(e);
    }
  });

  // OpenAPI operationId: markCrateReturned
  router.post('/:id/status/pending-return', validateJWT, authorizeRequest({ actionId: 'updateAny:crates' }), async (req, res, next) => {
    const crateId = req.params.id;

    try {
      const crate = await crateService.getCrateById(crateId);
      await crateService.markCrateReturned(crate);

      res.set('content-type', 'application/json');
      res.status(204);
      res.send();
    } catch (e) {
      next(e);
    }
  });

  // OpenAPI operationId: setCrateRecipient
  router.put('/:id/recipient', validateRequest(setRecipientSchema), validateJWT, authorizeRequest({ actionId: 'updateAny:crates' }), async (req, res, next) => {
    const crateId = req.params.id;
    const { recipientEmail } = req.body;

    try {
      const crate = await crateService.getCrateById(crateId);
      await crate.setRecipient(recipientEmail);

      res.set('content-type', 'application/json');
      res.status(204);
      res.send();
    } catch (e) {
      next(e);
    }
  });
  return router;
}

module.exports = CrateRouter;
