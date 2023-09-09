import { Request, Response } from 'express';
import movieModel from '../model/movie';
// import { Redis } from '../utils';
import { movieService } from '../services';
// const redisCache = Redis.getInstance();

export const getAllMoviesByFilter = async (req: Request, res: Response) => {
  const name = req.query.name;
  // const cacheKey = `${config.RedisCacheStore.movies}:${name}`;
  if (name) {
    // Add a method to invalidate the cache as well
    const movies = await movieService.fetchMoviesByName(name as string);
    return res.status(200).json(movies);
  }
  // this could have been added to one single service
  const movies = await movieService.fetchAllMovies();

  return res.status(200).json(movies);
};

export const getAllMovieById = async (req: Request, res: Response) => {
  if (!req.params?.id) {
    return res
      .status(400)
      .json({ message: 'Invalid request, missing id', success: false });
  }
  const movies = await movieModel.findById(req.params?.id).lean();
  return res.status(200).json(movies);
};

export const createMovie = async (req: Request, res: Response) => {
  await movieModel.create(req.body);
  return res.status(200).json('done');
};
