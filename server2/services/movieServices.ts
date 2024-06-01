import movieModel, { IMovie } from '../model/movie';
import { Redis } from '../infrastructure';
import config from '../config';
const { GetOrSetCache } = Redis.getInstance();

export class MovieServices {
  @GetOrSetCache(`${config.RedisCacheStore.movies}`)
  public async fetchMoviesByName(name: string) {
    return await movieModel.find({ name }).lean();
  }

  @GetOrSetCache(`${config.RedisCacheStore.movies}`)
  public async fetchAllMovies() {
    return await movieModel.find({}).lean();
  }
  public async fetchMovieById(id: string) {
    return await movieModel.findById(id).lean();
  }

  public async addMovie(movie: IMovie) {
    return await movieModel.create(movie);
  }
}

export const movieService = new MovieServices();
