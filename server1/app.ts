import Fastify from 'fastify';
import constants from './constants';
import { IReply, IQuerystring, IMovie } from './interfaces';
import { MongoDBClient, NetworkCall, CronJob, KafkaPublisher } from './utils';
import { pushFailedDataToDB } from './crons';
const { SERVER2URL, DB_URI, DB_NAME, REFLOW_COLLECTION, BROKERS, KAFKA_TOPIC } =
  constants;

// Need a Factory file for all these objects
const network = new NetworkCall.default(SERVER2URL);
const mongoClient = new MongoDBClient.default(
  DB_URI,
  DB_NAME,
  REFLOW_COLLECTION
);

const dataReflowPublisher = new KafkaPublisher.default(BROKERS),
  cronPublisher = new KafkaPublisher.default(BROKERS);

const cron = new CronJob.default();
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
      async (_request, reply) => {
        try {
          const data = await network.get<IMovie[] | []>(`/movies`);
          if (data.data) {
            return reply
              .code(200)
              .send({ success: true, message: '', data: data.data });
          }
          return reply.code(500).send({
            success: false,
            message: 'Internal Server Error',
            error: 'External Dependency Failure',
          });
        } catch (error) {
          return reply.code(500).send({
            success: false,
            message: 'Internal Server Error',
            error: error,
          });
        }
      }
    );
    server.post<{ Reply: IReply }>('/', async (request, reply) => {
      try {
        // Get Data from Request, Send data to server 2 if server 2 is up
        // If its not up then push it to kafka, and return an uid
        try {
          // @circuitBreaker({})
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
        return reply.code(500).send({
          success: false,
          message: 'Internal Server Error',
          error: error,
        });
      }
    });

    server.get<{ Reply: IReply }>('/:processId', async (_request, reply) => {
      try {
        // Get status of the data from mongodb itself
        return reply.code(200).send({ success: true, message: '', data: [] });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          message: 'Internal Server Error',
          error: error,
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
    console.log('Connected to Kafka Successfully');
  } catch (error) {
    console.error(err);
    process.exit(1);
  }
});
