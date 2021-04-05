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

   router.get("/", validateJWT, authorizeRequest({actionId: "readAny:crates"}), async function getAllCrates(req, res, next) {

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

    router.get("/:id", validateJWT, authorizeRequest({actionId: "readAny:crates"}), async function getCrateById(req, res, next) {
        const crateId = req.params.id;

        try {
            const crate = await crateService.getCrateById(crateId);
            res.set("content-type", "application/json");

            if (!crate) {
                res.status(404);
                res.end();
                return;  
            }
            
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

    router.get("/:id/shipments", validateJWT, authorizeRequest({actionId: "readAny:crates"}), async function getCrateShipmentsByCrateId(req, res, next) {
        const crateId = req.params.id;

        try {
            const crate = await crateService.getCrateById(crateId);
            const shipmentList = await crateService.getCrateTrips(crate);
            res.set("content-type", "application/json");
            
            res.status(200);
            res.json({
                entries: shipmentList.map((s) => s.toJSON()),
                count: shipmentList.length
            });
        }
        catch (e) {
            next(e);
        }
    });

    router.get("/:id/shipments/:shipmentId", validateJWT, authorizeRequest({actionId: "readOwn:crates", allowResourceOwnerOnly: false}), async function getCrateShipmentTelemetry(req, res, next) {
        const crateId = req.params.id;
        const shipmentId = req.params.shipmentId;

        try {
            const shipment = await crateService.getCrateTripById(shipmentId);
            res.set("content-type", "application/json");
            
            res.status(200);
            res.json({
                entries: [shipment],
                count: 1
            });
        }
        catch (e) {
            next(e);
        }
    });


    /****** POST *******/

    router.post("/", validateJWT, authorizeRequest({actionId: "createAny:crates"}), async function createCrate(req, res, next) {
        const crateData = req.body;

        try {
            const crate = await crateService.createCrate(crateData);
            await crate.save();
            res.set("content-type", "application/json");
            res.status(201);
            res.json({
                entries: [crate.toJSON()],
                count: 1
            });
        }
        catch (e) {
            next(e);
        }
    });

    router.post("/:id/shipments", validateJWT, authorizeRequest({actionId: "createAny:crates"}), async function startCrateShipment(req, res, next) {
        const crateId = req.params.id;
        const {originAddress, destinationAddress, trackingNumber} = req.body;

        try {
            const crate = await crateService.getCrateById(crateId);
            await crate.startTrip({
                originAddress, 
                destinationAddress, 
                trackingNumber
            });
            res.set("content-type", "application/json");
            res.status(201);
            res.json({
                entries: [crate.toJSON()],
                count: 1
            });
        }
        catch (e) {
            next(e);
        }
    });

    router.post("/:id/shipments/:shipmentId/waypoints", validateJWT, authorizeRequest({actionId: "createAny:crates"}), async function addShipmentWaypoint(req, res, next) {
        const crateId = req.params.id;
        const telemetry = req.body;

        try {
            const crate = await crateService.getCrateById(crateId);
            await crate.currentTrip.addWaypoint({telemetry});
            res.set("content-type", "application/json");
            res.status(201);
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

    router.put("/:id/recipient", validateJWT, authorizeRequest({actionId: "updateAny:crates"}), async function setRecipient(req, res, next) {
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

    router.put("/:id/shipments/:shipmentId/status", validateJWT, authorizeRequest({actionId: "updateAny:crates"}), async function setShipmentStatus(req, res, next) {
        const crateId = req.params.id;

        try {
            const crate = await crateService.getCrateById(crateId);
            await crate.completeTrip();
            res.status(204);
            res.send();
        }
        catch (e) {
            next(e);
        }
    });

    router.put("/:id/status", validateJWT, authorizeRequest({actionId: "updateAny:crates"}), async function setCrateStatus(req, res, next) {
        const crateId = req.params.id;

        try {
            const crate = await crateService.getCrateById(crateId);
            await crateService.markCrateReturned(crate);

            res.set("content-type", "application/json");
            res.status(204);
            res.send();
        }
        catch (e) {
            next(e);
        }
    });


    /****** DELETE *******/

    router.delete("/:id", validateJWT, authorizeRequest({actionId: "deleteAny:crates"}), async function deleteCrate(req, res, next) {
        const crateId = req.params.id;

        try {
            const crate = await crateService.deleteCrate(crateId);

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