/* istanbul ignore file */

const http = require("http");
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const events = require("events");
const eventEmitter = new events.EventEmitter();
const fetch = require("node-fetch");
const DatabaseConnector = require("./src/lib/database/connectors/memory"); 
const asiagoDatabaseConnector = new DatabaseConnector({ console });
const serverPort = process.env.SERVER_PORT || 3000;

/********************************SERVICES**************************************/
/**UserService**/
const { UserService } = require("./src/services/user");
const UserRepository = require("./src/lib/repository/user");
const IUserRepository = require("./src/interfaces/user-repository");
const usersRepo = new IUserRepository(new UserRepository(asiagoDatabaseConnector));
const userService = new UserService(usersRepo);

/**CacheService**/
const ICache = require("./src/interfaces/cache");
const CacheService = require("./src/lib/cache");
const cacheService = new ICache(new CacheService());

/**AuthService**/
const { UserAuthService } = require("./src/services/auth");
const authService = new UserAuthService({cacheService, userService});

/**CrateService**/
const { CrateService } = require("./src/services/crate");
const CrateRepository = require("./src/lib/repository/crate");
const CrateShipmentRepository = require("./src/lib/repository/crate-shipment");
const ICrateShipmentRepository = require("./src/interfaces/shipment-repository");
const ICrateRepository = require("./src/interfaces/crate-repository");
const crateRepo = new ICrateRepository(new CrateRepository(asiagoDatabaseConnector));
const crateShipmentRepo = new ICrateShipmentRepository(new CrateShipmentRepository(asiagoDatabaseConnector));
const crateService = new CrateService({crateRepo, crateShipmentRepo});

/**MerchantService**/
const { MerchantService } = require("./src/services/merchant");
const MerchantRepository = require("./src/lib/repository/merchant");
const IMerchantRepository = require("./src/interfaces/merchant-repository");
const merchantRepo = new IMerchantRepository(new MerchantRepository(asiagoDatabaseConnector));
const merchantService = new MerchantService(merchantRepo, userService);


/******************************************************************************/


/************************************APIS**************************************/

const UserAPI = require("./src/api/user");
const CrateAPI = require("./src/api/crate");
const StatusAPI = require("./src/api/status");
const MerchantAPI = require("./src/api/merchant");

/******************************************************************************/
app.set("view engine", "ejs");
app.use(cors());

/*
app.use(helmet());
app.use(morgan(globalConfig.application.morgan.verbosity, {
    skip: globalConfig.application.morgan.requestLoggingBehavior
}));
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("dist"));

/**********************************ROUTES**************************************/
app.use("/api/v1/users", UserAPI({
    authService,
    crateService,
    userService, 
    eventEmitter
}));

app.use("/api/v1/crates", CrateAPI({
    authService,
    crateService,
    eventEmitter
}));

app.use("/api/v1/merchants", MerchantAPI({
    merchantService,
    crateService,
    eventEmitter
}));

app.use("/status", StatusAPI());

app.use((req, res, next) => {
    //console.error(`Error 404 on ${req.url}.`);
    res.status(404).send({ status: 404, error: "NOT FOUND" });
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const msg = err.error || err.message;
    console.error(err);
    res.status(status).send({ status, error: "There was an error." });
});

if (process.env.NODE_ENV !== "ci/cd/test") {
    http.createServer(app).listen(serverPort, () => {
        console.info(
            "Application listening on port %d (http://localhost:%d)",
            serverPort,
            serverPort
        );
    });
}

module.exports = app;