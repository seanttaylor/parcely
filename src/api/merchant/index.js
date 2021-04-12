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

    router.post("/", validateJWT, authorizeRequest({actionId: "createAny:merchants"}), async(req, res, next) => {
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
        }

    });

    return router;
}

module.exports =  MerchantRouter;