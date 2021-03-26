/* istanbul ignore file */
const express = require("express");
const router = new express.Router();
/*
const {
    validateRequestBodyWith, 
    authorizeRequest, 
    validateJWT,
    validateUserCanLike,
    validateUserCanViewUnpublished
} = require("../../lib/middleware");
*/

/**
 * @param {UserService} userService - an instance of the UserService
 * @param {AuthService} authService - an instance of the AuthService
 * @param {EventEmitter} eventEmitter - an instance of the AuthService
 * @returns router - an instance of an Express router
 */

 function UserRouter({userService,  authService, eventEmitter}) {

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

    /*
    router.get("/:id", verifyUserExists, async(req, res, next) => {
        const userId = req.params.id;

        try {
            const userList = await userService.findUserById(userId);
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


    /*** POST ****/

    /*
    router.post("/token", async(req, res, next) => {
        const password = req.body.password;
        const userEmailAddress = req.body.emailAddress;
        const [user] = await userService.findUserByEmail(userEmailAddress);
        const result = await userService.isUserPasswordCorrect({user, password});

        if (!result) {
            res.status(401);
            res.json({
                data: [],
                errors: ["Email address and/or password do not match"],
                entries: 0
            });
        }
        const accessToken = await authService.issueAuthCredential(user);
        res.status(200);
        res.json({
            meta: {
                accessToken
            },
            data: [],
            errors: [],
            entries: 0
        });
    });
    */

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
        catch (e) {
            next(e);
        }
    });

    /*** PUT ***/

    /*
    router.put("/:id/name", validateJWT, validateRequestBodyWith({requiredFields: false, schema: "user"}), async(req, res, next) => {
        const userId = req.params.id;

        try {
            const [user] = await userService.findUserById(userId);
            await user.editName({firstName: req.body.firstName, lastName: req.body.lastName})
            res.set("content-type", "application/json");
            res.status(200);
            res.json({
                data: [user],
                entries: 1
            });
        }
        catch (e) {
            next(e);
        }
    });
    */

    /*
    router.put("/:id/phone", validateJWT, validateRequestBodyWith({requiredFields: false, schema: "user"}), async(req, res, next) => {
        const userId = req.params.id;

        try {
            const [user] = await userService.findUserById(userId);
            await user.editPhoneNumber(req.body.phoneNumber);
            res.set("content-type", "application/json");
            res.status(200);
            res.json({
                data: [user],
                entries: 1
            });
        }
        catch (e) {
            next(e);
        }
    });
    */

    

    


    return router;
}

module.exports = UserRouter;
