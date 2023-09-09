import movieModel from '../model/movie';
import { Redis } from '../utils';
import config from '../config';
const { GetOrSetCache } = Redis.getInstance();

class MovieServices {
  @GetOrSetCache(`${config.RedisCacheStore.movies}`)
  public async fetchMoviesByName(name: string) {
    return await movieModel.find({ name }).lean();
  }

  public async fetchAllMovies() {
    return await movieModel.find({}).lean();
  }
}

export const movieService = new MovieServices();
