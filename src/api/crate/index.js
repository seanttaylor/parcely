/* istanbul ignore file */
const express = require("express");
const router = new express.Router();
const {
    //validateRequestBodyWith, 
    authorizeRequest, 
    validateJWT,
} = require("../../lib/middleware");

/**
 * @param {CrateService} crateService - an instance of the CrateService
 * @param {EventEmitter} eventEmitter - an instance of EventEmitter
 * @returns router - an instance of an Express router
 */

 function CrateRouter({crateService, eventEmitter}) {

   router.get("/", authorizeRequest({actionId: "readAny:crates"}), async(req, res, next) => {

        try {
            const crateList = await crateService.getAllCrates();
            res.set("content-type", "application/json");
            res.status(200);
            res.json({
                entries: crateList.map(c => c.toJSON()),
                count: crateList.length
            });
        }
        catch (e) {
            next(e);
        }
    });


    return router;
 }

 module.exports = CrateRouter;