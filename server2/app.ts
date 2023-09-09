import express, { NextFunction, Request, Response } from 'express';
import config from './config';
import mongoConnection from './database/connection';

mongoConnection();

const app = express();

app.use((req, _res, next) => {
  // whitelist server1 ip
  const validIps = ['::1', '127.0.0.1', '::ffff:127.0.0.1'];

  if (validIps.includes(req.connection.remoteAddress || '')) {
    next();
  } else {
    const err = new Error('Bad IP: ' + req.connection.remoteAddress);
    next(err);
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.log('Error handler', err);
  res.status(err.status || 500);
  res.send('Something broke');
});

import {
  createMovie,
  getAllMovieById,
  getAllMoviesByFilter,
} from './controllers';

// Health Check
app.get('/', (_req: Request, res: Response) => {
  return res
    .status(200)
    .send({ message: 'Server 2 Api, Working', success: true });
});

app.get('/movies', getAllMoviesByFilter);

app.get('/movies/:id', getAllMovieById);

app.post('/movies', createMovie);

const host = config.HOST;
const port = config.PORT;

app.listen(port, () => {
  console.log(`Server running at ${host}:${port}/`);
});
