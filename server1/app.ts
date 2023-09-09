import Fastify from 'fastify';
import constants from './core/constants';
import {
  IReply,
  IQuerystring,
  IMovie,
  IHttpService,
  HttpStatusCodes,
  kafkaTopics,
  IReflow,
} from './core';
import {
  MongoDBClient,
  HttpNetworkCall,
  CronJob,
  KafkaPublisherFactory,
  logger,
} from './utils';
import { pushFailedDataToDB } from './crons';
import NetworkError from './utils/errors/NetworkError';
const { SERVER2URL, DB_URI, DB_NAME, REFLOW_COLLECTION, BROKERS } = constants;
import crypto from 'crypto';
// import {createTopic} from './utils/kafka/kafkaAdmin';

// Need a Factory file for all these objects
const network: IHttpService = new HttpNetworkCall(SERVER2URL);
const mongoClient = new MongoDBClient<IReflow>(
  DB_URI,
  DB_NAME,
  REFLOW_COLLECTION
);

const kafkaFactory = KafkaPublisherFactory.getInstance();

const dataReflowPublisher = kafkaFactory.createPublisher(
  { brokers: BROKERS, retry: { initialRetryTime: 2 } },
  kafkaTopics.MOVIE
);
const cronPublisher = kafkaFactory.createPublisher(
  {
    brokers: BROKERS,
    connectionTimeout: 3000,
  },
  kafkaTopics.MOVIE
);

const cron = new CronJob();
const cronFunction = pushFailedDataToDB.bind(
  this,
  ...[mongoClient, cronPublisher]
);
cron.start(cronFunction);

const server = Fastify({
  logger: true,
});

server.get<{ Reply: IReply }>('/', async function handler(_req, reply) {
  return reply.code(200).send({ message: 'Server 1 Running', success: true });
});

// Move controller's logic to controller folder
server.register(
  async function (server, _opts) {
    server.get<{ Querystring: IQuerystring; Reply: IReply }>(
      '/',
      async (request, reply) => {
        try {
          const response = await network.get<IMovie[] | []>(`/movies`, {
            params: request.query,
          });

          if (response.status == 200) {
            return reply
              .code(200)
              .send({ success: true, message: 'Done', data: response.data });
          } else {
            return reply.code(400).send({
              message: response.data.message,
              error: response.data.error,
              success: false,
            });
          }
        } catch (error) {
          if (error instanceof NetworkError) {
            // check in cache that if response for this request exists or not
            return reply.code(HttpStatusCodes.ExternalDependencyError).send({
              success: false,
              message: 'External Dependency Failure',
            });
          }

          return reply.code(500).send({
            success: false,
            message: 'Internal Server Error',
          });
        }
      }
    );
    server.post<{ Reply: IReply }>('/', async (request: any, reply) => {
      try {
        // Get Data from Request, Send data to server 2 if server 2 is up (check from circuit breaker)
        // If its not up then push it to kafka, and return an uid
        try {
          // @CircuitBreaker({})
          const data = await network.post('/movies', { data: request.body });
          return reply.code(200).send({
            success: true,
            data: data.data,
            message: 'Added Movie to database',
          });
        } catch (error) {
          // failed to post
          const processId = crypto.randomUUID();
          let dataBody: any = {
            data: { ...request.body },
            processId,
            success: false,
            retries: 5,
          };
          dataReflowPublisher
            .publish<IReflow>(JSON.stringify(dataBody), mongoClient)
            .catch((error) => {
              logger.error('Caught Error: ', error?.metadata);
            });
          return reply.code(200).send({
            success: true,
            message: `We are still processing the data, processId: ${processId}`,
          });
        }
      } catch (error) {
        logger.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Internal Server Error',
        });
      }
    });

    server.get<{ Reply: IReply }>('/:processId', async (_request, reply) => {
      try {
        // Get status of the data from mongodb itself
        return reply.code(200).send({ success: true, message: '', data: [] });
      } catch (error) {
        logger.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Internal Server Error',
        });
      }
    });
  },
  { prefix: '/api/movie' }
);

server.listen({ port: 3000 }, async (err, addr) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${addr}`);
  try {
    await dataReflowPublisher.connect();
    logger.info('Connected to Kafka Successfully');
  } catch (error) {
    logger.error('Could not connect to kafka: ', error);
    // process.exit(1);
  }
});
