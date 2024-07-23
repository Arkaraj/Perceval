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

  public async updateMovie(movieId: string, movieDetails: Partial<IMovie>) {
    const redisInstance = Redis.getInstance();
    const response = await Promise.all([
      movieModel
        .findByIdAndUpdate(movieId, movieDetails, {
          new: true,
        })
        .lean(),
      redisInstance.del(config.RedisCacheStore.movies),
    ]);
    console.log('FASDFASDFASD: ', response);
    return response[0];
  }
}

export const movieService = new MovieServices();
