import express, { Request, Response } from 'express';
import config from './config';
import mongoConnection from './database/connection';
import movieModel from './model/movie';

mongoConnection();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

app.post('/movies', async (req: Request, res: Response) => {
  await movieModel.create(req.body);
  return res.status(200).json('done');
});

const host = config.HOST;
const port = config.PORT;

app.listen(port, () => {
  console.log(`Server running at ${host}:${port}/`);
});
