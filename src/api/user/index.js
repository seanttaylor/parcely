/* istanbul ignore file */
const express = require('express');
const userSchema = require('../../schemas/api/user/user.json');

const router = new express.Router();
const {
  validateRequest,
  authorizeRequest,
  validateJWT,
} = require('../../lib/middleware');

/**
 * @param {UserService} userService - an instance of the UserService
 * @param {AuthService} authService - an instance of the AuthService
 * @param {EventEmitter} eventEmitter - an instance of the EventEmitter
 * @returns router - an instance of an Express router
 */

function UserRouter({
  userService, crateService, authService, eventEmitter,
}) {
  async function verifyUserExists(req, res, next) {
    const userExists = await userService.userExists(req.params.id);

    if (!userExists) {
      res.status(404);
      res.json({
        data: [],
        error: 'resource not found',
        entries: 0,
      });
      return;
    }

    next();
  }

  // OpenAPI operationId: getAllUsers
  router.get('/', validateJWT, authorizeRequest({ actionId: 'readAny:users' }), async (req, res, next) => {
    try {
      const userList = await userService.findAllUsers();
      res.set('content-type', 'application/json');
      res.status(200);
      res.json({
        entries: userList,
        error: null,
        count: userList.length,
      });
    } catch (e) {
      next(e);
    }
  });

  // OpenAPI operationId: getCratesByRecipient
  router.get('/:id/crates', validateJWT, authorizeRequest({ actionId: 'readOwn:crates' }), verifyUserExists, async (req, res, next) => {
    const { id } = req.params;

    try {
      const [user] = await userService.findUserById(id);
      const crateList = await crateService.getCratesByRecipient(user);
      res.set('content-type', 'application/json');
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

  // OpenAPI operationId: getUserById
  router.get('/:id', validateJWT, authorizeRequest({ actionId: 'readOwn:users' }), verifyUserExists, async (req, res, next) => {
    const userId = req.params.id;

    try {
      const userList = await userService.findUserById(userId);
      res.set('content-type', 'application/json');
      res.status(200);
      res.json({
        entries: userList,
        error: null,
        count: userList.length,
      });
    } catch (e) {
      next(e);
    }
  });

  // OpenAPI operationId: getUserShipmentHistory
  router.get('/:id/shipments', validateJWT, authorizeRequest({ actionId: 'readOwn:users' }), verifyUserExists, async (req, res, next) => {
    const userId = req.params.id;
    const statusFilter = req.query.status;

    try {
      const [user] = await userService.findUserById(userId);
      const shipmentList = await crateService.getShipmentHistoryOf(user, { filterBy: statusFilter });
      res.set('content-type', 'application/json');
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

  // OpenAPI operationId: verifyEmailExists
  router.get('/email-exists/:emailAddress', validateJWT, authorizeRequest({ actionId: 'readAny:users' }), async (req, res) => {
    const { emailAddress } = req.params;

    try {
      // This throws an error when the email address isn't found in the datastore
      await userService.findUserByEmail(emailAddress);
      res.set('content-type', 'application/json');
      res.status(200);
      res.send();
    } catch (e) {
      res.set('content-type', 'application/json');
      res.status(404);
      res.send();
    }
  });

  // OpenAPI operationId: getUserAccessToken
  router.post('/token', async (req, res) => {
    const { password } = req.body;
    const userEmailAddress = req.body.emailAddress;
    const [user] = await userService.findUserByEmail(userEmailAddress);
    const result = await userService.isUserPasswordCorrect({ user, password });
    const role = await userService.getUserRole(user);

    if (!result) {
      res.status(401);
      res.json({
        entries: [],
        error: 'Email address and/or password do not match',
        count: 0,

      });
      return;
    }

    const accessToken = await authService.issueAuthCredential(user, role);
    res.status(201);
    res.json({
      accessToken,
      userId: user.id,
    });
  });

  // OpenAPI operationId: createUser
  router.post('/', validateRequest(userSchema), async (req, res, next) => {
    const { password, ...requestBody } = req.body;

    try {
      const user = await userService.createUser(requestBody);
      await user.save();
      await userService.createUserPassword({ user, password });
      const token = await authService.issueAuthCredential(user);
      eventEmitter.emit('userService.newUserCreated', user);

      res.set('content-type', 'application/json');
      res.status(201);
      res.json({
        accessToken: token,
        userId: user.id,
      });
    } catch (e) {
      const [errorMessage] = e.message.split(' =>');

      if (errorMessage.includes('BadRequest')) {
        // console.error(e);
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

  // OpenAPI operationId: editName
  router.put('/:id/name', validateRequest(userSchema), validateJWT, verifyUserExists, authorizeRequest({ actionId: 'updateOwn:users' }), async (req, res, next) => {
    const userId = req.params.id;

    try {
      const [user] = await userService.findUserById(userId);
      await user.editName({ firstName: req.body.firstName, lastName: req.body.lastName });
      res.set('content-type', 'application/json');
      res.status(200);
      res.json({
        entries: [user],
        error: null,
        count: 1,
      });
    } catch (e) {
      next(e);
    }
  });

  // OpenAPI operationId: editPhoneNumber
  router.put('/:id/phone', validateRequest(userSchema), validateJWT, verifyUserExists, authorizeRequest({ actionId: 'updateOwn:users' }), async (req, res, next) => {
    const userId = req.params.id;
    const { phoneNumber } = req.body;

    try {
      const [user] = await userService.findUserById(userId);
      await user.editPhoneNumber(phoneNumber);
      res.set('content-type', 'application/json');
      res.status(200);
      res.json({
        entries: [user],
        error: null,
        count: 1,
      });
    } catch (e) {
      next(e);
    }
  });

  // OpenAPI operationId: editEmailAddress
  router.put('/:id/email', validateRequest(userSchema), validateJWT, verifyUserExists, authorizeRequest({ actionId: 'updateOwn:users' }), async (req, res, next) => {
    const userId = req.params.id;
    const { emailAddress } = req.body;

    try {
      const [user] = await userService.findUserById(userId);
      await user.editEmailAddress(emailAddress);
      res.set('content-type', 'application/json');
      res.status(200);
      res.json({
        entries: [user],
        error: null,
        count: 1,
      });
    } catch (e) {
      next(e);
    }
  });

  // OpenAPI operationId: resetPassword
  router.put('/:id/password', validateJWT, verifyUserExists, authorizeRequest({ actionId: 'updateOwn:users' }), async (req, res, next) => {
    const userId = req.params.id;
    const { password } = req.body;

    try {
      const [user] = await userService.findUserById(userId);
      await userService.resetUserPassword({ user, password });
      res.set('content-type', 'application/json');
      res.status(204);
      res.send();
    } catch (e) {
      next(e);
    }
  });

  return router;
}

module.exports = UserRouter;
