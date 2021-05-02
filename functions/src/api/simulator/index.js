/* istanbul ignore file */

const express = require('express');

const router = new express.Router();
const {
  authorizeRequest,
  validateJWT,
} = require('../../lib/middleware');
/**
 *
 * @param {ShipmentSimulatorService} simulatorService - an instance of ShipmentSimulatorService
 * @returns router - an instance of an Express router
 */

function SimulatorRouter(simulatorService) {
  /** POST */
  router.post('/', validateJWT, authorizeRequest({ actionId: 'createAny:simulations' }), async (req, res, next) => {
    try {
      const { instanceCount, intervalMillis } = req.body;
      const simulation = await simulatorService.init({
        instanceCount,
        intervalMillis,
      });

      res.set('content-type', 'application/json');
      res.status(201);
      res.json({
        entries: [simulation.toJSON()],
        error: null,
        count: 1,
      });
    } catch (e) {
      next(e);
    }
  });

  router.post('/:id/start', validateJWT, authorizeRequest({ actionId: 'updateAny:simulations' }), async (req, res, next) => {
    res.set('content-type', 'application/json');
    try {
      const [simulation] = simulatorService.getSimulations().filter((s) => s.id === req.params.id);

      if (!simulation) {
        res.status(404);
        res.send();
        return;
      }

      simulation.start();
      res.status(204);
      res.send();
    } catch (e) {
      next(e);
    }
  });

  router.post('/:id/end', validateJWT, authorizeRequest({ actionId: 'updateAny:simulations' }), (req, res, next) => {
    res.set('content-type', 'application/json');
    try {
      const [simulation] = simulatorService.getSimulations().filter((s) => s.id === req.params.id);

      if (!simulation) {
        res.status(404);
        res.send();
        return;
      }

      simulation.end();
      res.status(204);
      res.send();
    } catch (e) {
      next(e);
    }
  });

  /** GET */
  router.get('/:id', validateJWT, authorizeRequest({ actionId: 'readAny:simulations' }), async (req, res, next) => {
    res.set('content-type', 'application/json');
    try {
      const [simulation] = simulatorService.getSimulations().filter((s) => s.id === req.params.id);

      if (!simulation) {
        res.status(404);
        res.send();
        return;
      }

      res.status(200);
      res.json({
        entries: [simulation.toJSON()],
        error: null,
        count: 1,
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
}

module.exports = SimulatorRouter;
