/* istanbul ignore file */

const express = require("express");
const router = new express.Router();
const {
    authorizeRequest, 
    validateJWT,
} = require("../../lib/middleware");

/**
 * @param {MerchantService} merchantService - an instance of MerchantService
 * @param {EventEmitter} eventEmitter - an instance of EventEmitter
 * @returns router - an instance of an Express router
 */


function MerchantRouter({merchantService, eventEmitter}) {

    function merchantAuthzOverride(mechantService) {
        return async function(decodedToken) {
            const existingMerchant = await merchantService.merchantExists(decodedToken.sub);

            return existingMerchant.userId === decodedToken.sub;
        }
    }
    
    /**POST**/
    router.post("/", validateJWT, authorizeRequest({actionId: "createAny:merchants"}), async function createMerchant(req, res, next) {
        const merchantData = req.body;
        res.set("content-type", "application/json"); 

        try {
            const merchant = await merchantService.createMerchant(merchantData);
            await merchant.save();

            res.status(201);
            res.json({
                entries: [merchant],
                count: 1
            });

        } catch(e) {
            const [errorMessage] = e.message.split(" =>")
            if (errorMessage.includes( "MerchantServiceError.CannotCreateMerchant.BadRequest")) {
                res.status(400);
                res.json({
                    entries: [],
                    error: e.message,
                    count: 0
                });
                return;
            }
            next(e);
        }

    });

    /**GET**/
    router.get("/:id", validateJWT, authorizeRequest({
        actionId: "readOwn:merchants",
        authzOverride: merchantAuthzOverride(merchantService)
    }), async function getMerchantById(req, res, next) {
        const merchantId = req.params.id;
        res.set("content-type", "application/json"); 

        try {
            const merchant = await merchantService.getMerchantById(merchantId);

            res.status(200);
            res.json({
                entries: [merchant],
                count: 1
            });

        } catch(e) {
            next(e);
        }

    });



    /**PUT**/
    router.put("/:id/plan", validateJWT, authorizeRequest({
        actionId: "updateOwn:merchants",
        authzOverride: merchantAuthzOverride(merchantService)
    }), async function updatePlan(req, res, next) {
        const merchantId = req.params.id;
        const updatedPlan = req.body;

        res.set("content-type", "application/json"); 

        try {
            const merchant = await merchantService.getMerchantById(merchantId);
            await merchant.updatePlan(updatedPlan);

            res.status(204);
            res.send();

        } catch(e) {
            next(e);
        }

    });

    return router;
}

module.exports =  MerchantRouter;