import Fastify from 'fastify';
import constants from './core/constants';
import {
  IReply,
  IQuerystring,
  IMovie,
  IHttpService,
  HttpStatusCodes,
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
const { SERVER2URL, DB_URI, DB_NAME, REFLOW_COLLECTION, BROKERS, KAFKA_TOPIC } =
  constants;

// Need a Factory file for all these objects
const network: IHttpService = new HttpNetworkCall(SERVER2URL);
const mongoClient = new MongoDBClient(DB_URI, DB_NAME, REFLOW_COLLECTION);

const kafkaFactory = KafkaPublisherFactory.getInstance();

const dataReflowPublisher = kafkaFactory.createPublisher({ brokers: BROKERS }),
  cronPublisher = kafkaFactory.createPublisher({
    brokers: BROKERS,
    connectionTimeout: 3000,
  });

const cron = new CronJob();
const cronFunction = pushFailedDataToDB.bind(mongoClient, cronPublisher);
cron.start(cronFunction);

const server = Fastify({
  logger: true,
});

server.get<{ Reply: IReply }>('/', async function handler(_req, reply) {
  return reply.code(200).send({ message: 'Server 1 Running', success: true });
});

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
    server.post<{ Reply: IReply }>('/', async (request, reply) => {
      try {
        // Get Data from Request, Send data to server 2 if server 2 is up
        // If its not up then push it to kafka, and return an uid
        try {
          // @CircuitBreaker({})
          await network.post('/movies', { data: request.body });
        } catch (error) {
          // failed to post
          dataReflowPublisher.publish(
            KAFKA_TOPIC,
            JSON.stringify(request.body),
            mongoClient
          );
        }
        return reply.code(200).send({
          success: true,
          message: `We are still processing the data, processId: ${2}`,
        });
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
    // Add some logger
    logger.error('Could not connect to kafka: ', error);
    process.exit(1);
  }
});
