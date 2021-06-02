/* istanbul ignore file */
const express = require('express');
const createMerchantSchema = require('../../schemas/api/merchant/merchant.json');
const updateMerchantPlanSchema = require('../../schemas/api/merchant/plan.json');

const router = new express.Router();
const {
  authorizeRequest,
  validateRequest,
  validateJWT,
} = require('../../lib/middleware');

/**
 * @param {MerchantService} merchantService - an instance of MerchantService
 * @param {CrateService} crateService - an instance of CrateService
 * @returns router - an instance of an Express router
 */

function MerchantRouter({ merchantService, crateService }) {
  function merchantAuthzOverride(merchantService) {
    return async function (decodedToken) {
      const existingMerchant = await merchantService.merchantExists(decodedToken.sub);

      return existingMerchant.userId === decodedToken.sub;
    };
  }

  /** ***POST**** */
  router.post('/', validateRequest(createMerchantSchema), validateJWT, authorizeRequest({ actionId: 'createAny:merchants' }), async (req, res, next) => {
    const merchantData = req.body;
    res.set('content-type', 'application/json');

    try {
      const merchant = await merchantService.createMerchant(merchantData);
      await merchant.save();

      res.status(201);
      res.json({
        entries: [merchant],
        error: null,
        count: 1,
      });
    } catch (e) {
      const [errorMessage] = e.message.split(' =>');

      if (errorMessage.includes('MerchantServiceError.CannotCreateMerchant.BadRequest')) {
        res.status(400);
        res.json({
          entries: [],
          error: e.message,
          count: 0,
        });
        return;
      }
      next(e);
    }
  });

  router.post('/:id/plan/cancel', validateJWT, authorizeRequest({
    actionId: 'updateOwn:merchants',
    authzOverride: merchantAuthzOverride(merchantService),
  }), async (req, res, next) => {
    const merchantId = req.params.id;
    res.set('content-type', 'application/json');

    try {
      const merchant = await merchantService.getMerchantById(merchantId);
      await merchant.cancelPlan();
      res.status(204);
      res.send();
    } catch (e) {
      const [errorMessage] = e.message.split(' =>');

      if (errorMessage.includes('MerchantServiceError.CannotCreateMerchant.BadRequest')) {
        res.status(400);
        res.json({
          entries: [],
          error: e.message,
          count: 0,
        });
        return;
      }
      next(e);
    }
  });

  router.post('/:id/status/archived', validateJWT, authorizeRequest({
    actionId: 'updateAny:merchants',
  }), async (req, res, next) => {
    const merchantId = req.params.id;

    res.set('content-type', 'application/json');

    try {
      const merchant = await merchantService.getMerchantById(merchantId);
      await merchantService.archiveMerchant(merchant);

      res.status(204);
      res.send();
    } catch (e) {
      next(e);
    }
  });

  /** ***GET****** */
  router.get('/:id', validateJWT, authorizeRequest({
    actionId: 'readOwn:merchants',
    authzOverride: merchantAuthzOverride(merchantService),
  }), async (req, res, next) => {
    const merchantId = req.params.id;
    res.set('content-type', 'application/json');

    try {
      const merchant = await merchantService.getMerchantById(merchantId);

      if (!merchant) {
        res.status(404);
        res.end();
        return;
      }

      res.status(200);
      res.json({
        entries: [merchant],
        error: null,
        count: 1,
      });
    } catch (e) {
      next(e);
    }
  });

  router.get('/:id/crates', validateJWT, authorizeRequest({
    actionId: 'readOwn:merchants',
    authzOverride: merchantAuthzOverride(merchantService),
  }), async (req, res, next) => {
    const merchantId = req.params.id;
    res.set('content-type', 'application/json');

    try {
      const crateList = await crateService.getCratesByMerchantId(merchantId);

      res.status(200);
      res.json({
        entries: crateList,
        error: null,
        count: crateList.length,
      });
    } catch (e) {
      next(e);
    }
  });

  router.get('/:id/shipments', validateJWT, authorizeRequest({
    actionId: 'readOwn:merchants',
    authzOverride: merchantAuthzOverride(merchantService),
  }), async (req, res, next) => {
    const merchantId = req.params.id;
    const { asDigest } = req.query;
    res.set('content-type', 'application/json');

    try {
      const merchant = await merchantService.getMerchantById(merchantId);

      if (!merchant) {
        res.status(404);
        res.end();
        return;
      }
      const shipmentList = await crateService.getShipmentsByMerchantId({ merchantId, asDigest });

      res.status(200);
      res.json({
        entries: shipmentList,
        error: null,
        count: shipmentList.length,
      });
    } catch (e) {
      next(e);
    }
  });

  router.get('/:id/shipments/:shipmentId', validateJWT, authorizeRequest({ actionId: 'readOwn:crates' }), async (req, res, next) => {
    const merchantId = req.params.id;
    const { shipmentId } = req.params;
    const { asDigest } = req.query;

    try {
      const shipmentList = await crateService.getShipmentsByMerchantId({ merchantId, asDigest });
      const currentShipment = shipmentList.find((shipment) => shipment.id === shipmentId);

      if (!currentShipment) {
        next();
        return;
      }

      res.set('content-type', 'application/json');
      res.status(200);
      res.json({
        entries: [currentShipment.toJSON()],
        error: null,
        count: 1,
      });
    } catch (e) {
      next(e);
    }
  });

  router.get('/:id/shipments/:shipmentId/waypoints', validateJWT, authorizeRequest({ actionId: 'readOwn:crates' }), async (req, res, next) => {
    const merchantId = req.params.id;
    const { asDigest } = req.query;
    const { shipmentId } = req.params;

    try {
      const shipmentList = await crateService.getShipmentsByMerchantId({
        merchantId,
        asDigest,
      });
      const currentShipment = shipmentList.find((shipment) => shipment.id === shipmentId);

      if (!currentShipment) {
        next();
        return;
      }

      res.set('content-type', 'application/json');
      res.status(200);
      res.json({
        entries: currentShipment.waypoints,
        error: null,
        count: currentShipment.waypoints.length,
      });
    } catch (e) {
      next(e);
    }
  });

  /** PUT* */
  router.put('/:id/plan', validateRequest(updateMerchantPlanSchema), validateJWT, authorizeRequest({
    actionId: 'updateOwn:merchants',
    authzOverride: merchantAuthzOverride(merchantService),
  }), async (req, res, next) => {
    const merchantId = req.params.id;
    const updatedPlan = req.body;

    res.set('content-type', 'application/json');

    try {
      const merchant = await merchantService.getMerchantById(merchantId);
      await merchant.updatePlan(updatedPlan);

      res.status(204);
      res.send();
    } catch (e) {
      next(e);
    }
  });

  return router;
}

module.exports = MerchantRouter;
