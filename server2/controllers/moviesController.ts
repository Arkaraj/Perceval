import { Response } from 'express';
import { movieService, MovieServices } from '../services';
import { Result } from '../util/response.util';

export class MovieController {
  constructor(private readonly movieService: MovieServices) {}

  private controllerError(req: any, res: Response, error: any) {
    return res
      .status(500)
      .json(Result.error(error?.message || 'ISE', req?.traceId));
  }

  public async getAllMoviesByFilter(req: any, res: Response) {
    try {
      const name = req.query.name;
      if (name) {
        console.log(this);
        // Add a method to invalidate the cache as well
        const movies = await this.movieService.fetchMoviesByName(
          name as string
        );
        return res.status(200).json(Result.success(movies, req?.traceId));
      }
      // this could have been added to one single service
      const movies = await this.movieService.fetchAllMovies();

      return res.status(200).json(Result.success(movies, req?.traceId));
    } catch (error) {
      return this.controllerError(req, res, error);
    }
  }

  public async getAllMovieById(req: any, res: Response) {
    try {
      if (!req.params?.id) {
        return res
          .status(400)
          .json({ message: 'Invalid request, missing id', success: false });
      }
      const movie = await this.movieService.fetchMovieById(req?.params?.id);
      return res.status(200).json(Result.success(movie, req?.traceId));
    } catch (error) {
      return this.controllerError(req, res, error);
    }
  }

  public async createMovie(req: any, res: Response) {
    try {
      await this.movieService.addMovie(req.body);
      return res.status(200).json(Result.success('done', req?.traceId));
    } catch (error) {
      return this.controllerError(req, res, error);
    }
  }

  public async updateMovie(req: any, res: Response) {
    try {
      await this.movieService.updateMovie(req.params.id, req.body);
      return res.status(200).json(Result.success('done', req?.traceId));
    } catch (error) {
      return this.controllerError(req, res, error);
    }
  }
}

export const movieController: MovieController = new MovieController(
  movieService
);
