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

   /****** GET *******/

   router.get("/", authorizeRequest({actionId: "readAny:crates"}), async function getAllCrates(req, res, next) {

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

    router.get("/:id", authorizeRequest({actionId: "readAny:crates"}), async function getCrateById(req, res, next) {
        const crateId = req.params.id;

        try {
            const crate = await crateService.getCrateById(crateId);
            res.set("content-type", "application/json");
            res.status(200);
            res.json({
                entries: [crate.toJSON()],
                count: 1
            });
        }
        catch (e) {
            next(e);
        }
    });


    /****** POST *******/

    router.post("/", authorizeRequest({actionId: "createAny:crates"}), async function createCrate(req, res, next) {
        const crateData = req.body;

        try {
            const crate = await crateService.createCrate(crateData);
            await crate.save();
            res.set("content-type", "application/json");
            res.status(200);
            res.json({
                entries: [crate.toJSON()],
                count: 1
            });
        }
        catch (e) {
            next(e);
        }
    });


    /****** PUT *******/

    router.put("/:id/recipient", authorizeRequest({actionId: "updateAny:crates"}), async function setRecipient(req, res, next) {
        const crateId = req.params.id;
        const recipientId = req.body.recipientId;

        try {
            const crate = await crateService.getCrateById(crateId);
            await crate.setRecipient(recipientId);

            res.set("content-type", "application/json");
            res.status(204);
            res.send();
        }
        catch (e) {
            next(e);
        }
    });


    return router;
 }

 module.exports = CrateRouter;