/* istanbul ignore file */
const express = require("express");
const router = new express.Router();
const {
    //validateRequestBodyWith, 
    authorizeRequest, 
    validateJWT,
} = require("../../lib/middleware");

/**
 * @param {AuthService} authService - an instance of the AuthService
 * @param {EventEmitter} eventEmitter - an instance of the AuthService
 * @returns router - an instance of an Express router
 */

 function CrateRouter() {

   /*
   router.get("/", async(req, res, next) => {

        try {
            const userList = await userService.findAllUsers();
            res.set("content-type", "application/json");
            res.status(200);
            res.json({
                data: userList.map(u => u.toJSON()),
                entries: userList.length
            });
        }
        catch (e) {
            next(e);
        }
    });
    */


    return router;
 }

 module.exports = CrateRouter;