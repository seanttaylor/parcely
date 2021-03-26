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
const AuthService = require("./src/services/auth");
const authService = new AuthService({cacheService, userService});
/******************************************************************************/


/************************************APIS**************************************/

const UserAPI = require("./src/api/user");

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
    userService, 
    authService,
    eventEmitter
}));

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