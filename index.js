/* istanbul ignore file */

const http = require('http');
const express = require('express');
const path = require('path');
// const helmet = require('helmet');
// const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const events = require('events');
const DatabaseConnector = require('./src/lib/database/connectors/memory');
const config = require('./src/config');

const app = express();
const eventEmitter = new events.EventEmitter();
const asiagoDatabaseConnector = new DatabaseConnector({ console });
const serverPort = process.env.PORT || 3000;

/** ******************************SERVICES******************************** */

/** UserService* */
const { UserService } = require('./src/services/user');
const UserRepository = require('./src/lib/repository/user');
const IUserRepository = require('./src/interfaces/user-repository');

const usersRepo = new IUserRepository(new UserRepository(asiagoDatabaseConnector));
const userService = new UserService(usersRepo);

/** CacheService* */
const ICache = require('./src/interfaces/cache');
const CacheService = require('./src/lib/cache');

const cacheService = new ICache(new CacheService());

/** StorageBucketService* */
const IStorageBucket = require('./src/interfaces/storage-bucket');
const { InMemoryStorageBucket } = require('./src/lib/storage');

const storageBucketService = new IStorageBucket(new InMemoryStorageBucket());

/** QueueService* */
const IQueue = require('./src/interfaces/queue');
const { InMemoryQueue } = require('./src/lib/queue');

const queueService = new IQueue(new InMemoryQueue());

/** StreamService */
const IStreamService = require('./src/interfaces/stream');
const { LocalStream, RemoteStream, MockStream } = require('./src/lib/stream');

console.log(process.env.NODE_ENV);

const streamServiceImplMap = {
  'ci/cd/test': MockStream,
  local: LocalStream,
  production: RemoteStream,
  undefined: MockStream,
};

const StreamServiceImpl = streamServiceImplMap[process.env.NODE_ENV];
const streamService = new IStreamService(new StreamServiceImpl());

/** AuthService* */
const { UserAuthService } = require('./src/services/auth');

const authService = new UserAuthService({ cacheService, userService, config });

/** CrateService* */
const { CrateService } = require('./src/services/crate');
const CrateRepository = require('./src/lib/repository/crate');
const CrateShipmentRepository = require('./src/lib/repository/crate-shipment');
const ICrateShipmentRepository = require('./src/interfaces/shipment-repository');
const ICrateRepository = require('./src/interfaces/crate-repository');

const crateRepo = new ICrateRepository(new CrateRepository(asiagoDatabaseConnector));
const crateShipmentRepo = new ICrateShipmentRepository(new CrateShipmentRepository(asiagoDatabaseConnector));
const crateService = new CrateService({
  crateRepo,
  crateShipmentRepo,
  streamService,
  queueService,
  eventEmitter,
  userService,
  storageBucketService,
});

/** MerchantService* */
const { MerchantService } = require('./src/services/merchant');
const MerchantRepository = require('./src/lib/repository/merchant');
const IMerchantRepository = require('./src/interfaces/merchant-repository');

const merchantRepo = new IMerchantRepository(new MerchantRepository(asiagoDatabaseConnector));
const merchantService = new MerchantService({ repo: merchantRepo, userService });

/** PublishService */
const IPublisher = require('./src/interfaces/publisher');
const SSEPublisher = require('./src/lib/publisher/sse');

const ssePublishService = new IPublisher(new SSEPublisher(eventEmitter));

/** SimulationService* */
const { ShipmentSimulatorService } = require('./src/services/simulator');

const simulatorService = new ShipmentSimulatorService({
  userService,
  merchantService,
  crateService,
  eventEmitter,
});

/** HardwareCrateService* */
const IHardwareCrateService = require('./src/interfaces/hardware-crate');
const RemoteHardwareCrateService = require('./src/lib/hardware-crate/remote');
const mockHardwareCrateService = require('./src/lib/utils/mocks/hardware-crate-service');

const hardwareCrateServiceImpl = process.env.NODE_ENV === 'ci/cd/test' ? mockHardwareCrateService : new RemoteHardwareCrateService(config);
const hardwareCrateService = new IHardwareCrateService(hardwareCrateServiceImpl);

/** *************************************************************************** */

/** **********************************APIS************************************* */

const UserAPI = require('./src/api/user');
const CrateAPI = require('./src/api/crate');
const StatusAPI = require('./src/api/status');
const MerchantAPI = require('./src/api/merchant');
const SimulatorAPI = require('./src/api/simulator');
const StorageAPI = require('./src/api/storage');

/** *************************************************************************** */
app.set('view engine', 'ejs');
app.use(cors());

/*
app.use(helmet());
*/
app.use(morgan(config.application.logger.verbosity, {
  skip: config.application.logger.behavior,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('dist'));

/** ********************************ROUTES************************************* */
app.use('/api/v1/users', UserAPI({
  authService,
  crateService,
  userService,
  eventEmitter,
}));

app.use('/api/v1/crates', CrateAPI({
  authService,
  crateService,
  hardwareCrateService,
  queueService,
  eventEmitter,
  userService,
  publishService: ssePublishService,
}));

app.use('/api/v1/merchants', MerchantAPI({
  merchantService,
  crateService,
  eventEmitter,
}));

app.use('/api/v1/simulations', SimulatorAPI(simulatorService));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/dist/ejs'));
app.use(express.static('dist'));

app.use('/simulator', (req, res) => {
  const simulations = simulatorService.getSimulations();
  res.render('index', { data: { simulations } });
});

app.use('/storage', StorageAPI(storageBucketService));

app.use('/status', StatusAPI(config));

app.use((req, res) => {
  // console.error(`Error 404 on ${req.url}.`);
  res.status(404).send({ status: 404, error: 'Not Found' });
});

app.use((err, req, res) => {
  const status = err.status || 500;
  // const msg = err.error || err.message;
  console.error(err);
  res.status(status).send({ status, error: 'There was an error.' });
});

if (process.env.NODE_ENV !== 'ci/cd/test') {
  http.createServer(app).listen(serverPort, () => {
    console.info(
      'parcely_core listening on port %d (http://localhost:%d)',
      serverPort,
      serverPort,
    );
  });
}

module.exports = app;
