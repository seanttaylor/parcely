/* istanbul ignore file */
const express = require("express");
const router = new express.Router();
const {
    //validateRequestBodyWith, 
    authorizeRequest, 
    validateJWT,
} = require("../../lib/middleware");

/**
 * @param {UserService} userService - an instance of the UserService
 * @param {AuthService} authService - an instance of the AuthService
 * @param {EventEmitter} eventEmitter - an instance of the AuthService
 * @returns router - an instance of an Express router
 */

 function UserRouter({userService, crateService, authService, eventEmitter}) {

    async function verifyUserExists(req, res, next) {
        const userExists = await userService.userExists(req.params.id);

        if (!userExists) {
            res.status(404);
            res.json({
                data: [],
                errors: [],
                entries: 0
            });
            return; 
        }

        next();
    }


    /****** GET *******/

    
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

    
    router.get("/:id/crates", validateJWT, authorizeRequest({actionId: "readOwn:crates"}), verifyUserExists, async function getCratesByRecipient(req, res, next) {
        const id = req.params.id;

        try {
            const [user] = await userService.findUserById(id);
            const crateList = await crateService.getCratesByRecipient(user);
            res.set("content-type", "application/json");
            res.status(200);
            res.json({
                entries: crateList.map(c => c.toJSON()),
                count: crateList.length
            });
        }
        catch(e) {
            next(e);
        }
    });
    
    
    router.get("/:id", validateJWT, authorizeRequest({actionId: "readOwn:users"}), verifyUserExists, async function getUserById(req, res, next) {
        const userId = req.params.id;

        try {
            const userList = await userService.findUserById(userId);
            res.set("content-type", "application/json");
            res.status(200);
            res.json({
                entries: userList.map(u => u.toJSON()),
                count: userList.length
            });
        }
        catch (e) {
            next(e);
        }
    });


    router.get("/:id/shipments", validateJWT, authorizeRequest({actionId: "readOwn:users"}), verifyUserExists, async function getUserShipmentHistory(req, res, next) {
        const userId = req.params.id;
        const statusFilter = req.query.status;

        try {
            const [user] = await userService.findUserById(userId);
            const shipmentList = await crateService.getShipmentHistoryOf(user, {filterBy: statusFilter});
            res.set("content-type", "application/json");
            res.status(200);
            res.json({
                entries: shipmentList.map(t => t.toJSON()),
                count: shipmentList.length
            });
        }
        catch (e) {
            next(e);
        }
    });


    router.get("/email_exists/:emailAddress", validateJWT, authorizeRequest({actionId: "readAny:users"}), async function verifyEmailExists(req, res, next) {
        const emailAddress = req.params.emailAddress;
        
        try {
            //This throws an error when the email address isn't found in the datastore
            const [user] = await userService.findUserByEmail(emailAddress);            
            res.set("content-type", "application/json");
            res.status(200);
            res.send();
        }
        catch (e) {
            res.set("content-type", "application/json");
            res.status(404);
            res.send();
        }
    });


    /*** POST ****/

    
    router.post("/token", async function getUserAccessToken(req, res, next) {
        const password = req.body.password;
        const userEmailAddress = req.body.emailAddress;
        const [user] = await userService.findUserByEmail(userEmailAddress);
        const result = await userService.isUserPasswordCorrect({user, password});
        const role = await userService.getUserRole(user);

        if (!result) {
            res.status(401);
            res.json({
                error: "Email address and/or password do not match"
            });
        }
        const accessToken = await authService.issueAuthCredential(user, role);
        res.status(200);
        res.json({
            accessToken,
            userId: user.id
        });
    });

    router.post("/", async function createUser(req, res, next) {
        const {password, ...requestBody} = req.body;

        try {
            const user = await userService.createUser(requestBody);
            await user.save();
            await userService.createUserPassword({user, password});
            const token = await authService.issueAuthCredential(user);
            eventEmitter.emit("userService.newUserCreated", user);

            res.set("content-type", "application/json");
            res.status(200);
            res.json({
                accessToken: token,
                userId: user.id,
            });
        }
        catch(e) {
            next(e);
        }
    });

    /*** PUT ***/

    
    router.put("/:id/name", validateJWT, verifyUserExists, authorizeRequest({actionId: "updateOwn:users"}), async function editName(req, res, next) {
        const userId = req.params.id;

        try {
            const [user] = await userService.findUserById(userId);
            await user.editName({firstName: req.body.firstName, lastName: req.body.lastName})
            res.set("content-type", "application/json");
            res.status(200);
            res.json({
                entries: [user],
                error: null,
                count: 1
            });
        }
        catch (e) {
            next(e);
        }
    });
    
    router.put("/:id/phone", validateJWT, verifyUserExists, authorizeRequest({actionId: "updateOwn:users"}), async function editPhoneNumber(req, res, next) {
        const userId = req.params.id;
        const phoneNumber = req.body.phoneNumber;

        try {
            const [user] = await userService.findUserById(userId);
            await user.editPhoneNumber(phoneNumber);
            res.set("content-type", "application/json");
            res.status(200);
            res.json({
                entries: [user],
                count: 1
            });
        }
        catch (e) {
            next(e);
        }
    });


    router.put("/:id/email", validateJWT, verifyUserExists, authorizeRequest({actionId: "updateOwn:users"}), async function editEmailAddress(req, res, next) {
        const userId = req.params.id;
        const emailAddress = req.body.emailAddress;

        try {
            const [user] = await userService.findUserById(userId);
            await user.editEmailAddress(emailAddress);
            res.set("content-type", "application/json");
            res.status(200);
            res.json({
                entries: [user],
                count: 1
            });
        }
        catch (e) {
            next(e);
        }
    });

    return router;
}

module.exports = UserRouter;
