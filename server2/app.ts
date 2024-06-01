import express, { NextFunction, Request, Response } from 'express';
import { Kafka } from 'kafkajs';
import config from './config';
import mongoConnection from './database/connection';
import { ConsumerService } from './infrastructure';
import { addTraceId, whiteListIps } from './middleware';
import { movieController } from './controllers';
import { movieMessageHandler } from './services';
import { kafkaTopics } from './core';

// can create a factory for this, ...but this is just a dummy example
const kafka = new Kafka({
  brokers: config.KAFKA_BROKERS,
});

const consumserService = new ConsumerService(kafka);
consumserService.susbcribe(config.KAFKA_GROUP_ID, [
  {
    topic: kafkaTopics.MOVIE,
    messageProcessor: movieMessageHandler,
  },
]);

mongoConnection();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(whiteListIps);
app.use(addTraceId);

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.log('Error handler', err);
  res.status(err.status || 500);
  res.send('Something broke');
});

// Health Check
app.get('/', (req: any, res: Response) => {
  return res.status(200).send({
    message: 'Server 2 Api, Working',
    success: true,
    traceId: req?.traceId,
  });
});

app.get('/movies', movieController.getAllMoviesByFilter.bind(movieController));

app.get('/movies/:id', movieController.getAllMovieById.bind(movieController));

app.post('/movies', movieController.createMovie.bind(movieController));

process.on('beforeExit', (code) => {
  console.error(`Process beforeExit event with code: ${code}`);
});

process.on('uncaughtException', (error) => {
  console.error(`Process uncaughtException event with error: ${error}`);
});

const host = config.HOST;
const port = config.PORT;

app.listen(port, () => {
  console.log(`Server running at ${host}:${port}/`);
});
