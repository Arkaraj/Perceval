import express, { NextFunction, Request, Response } from 'express';
import config from './config';
import mongoConnection from './database/connection';
import movieModel from './model/movie';

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

app.get('/', (_req: Request, res: Response) => {
  return res
    .status(200)
    .send({ message: 'Server 2 Api, Working', success: true });
});

app.get('/movies', async (req: Request, res: Response) => {
  let filter: any = {};
  if (req.query.name) {
    filter.name = req.query.name;
  }
  const movies = await movieModel.find(filter).lean();
  return res.status(200).json(movies);
});

app.get('/movies/:id', async (req: Request, res: Response) => {
  if (!req.params?.id) {
    return res
      .status(400)
      .json({ message: 'Invalid request, missing id', success: false });
  }
  const movies = await movieModel.findById(req.params?.id).lean();
  return res.status(200).json(movies);
});

app.post('/movies', async (req: Request, res: Response) => {
  await movieModel.create(req.body);
  return res.status(200).json('done');
});

const host = config.HOST;
const port = config.PORT;

app.listen(port, () => {
  console.log(`Server running at ${host}:${port}/`);
});
