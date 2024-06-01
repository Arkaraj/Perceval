import { IMovie } from '../../model/movie';

export enum kafkaTopics {
  MOVIE = 'movie',
}

export interface IMovieMessage {
  data: Partial<IMovie>;
  processId: string;
  success: false;
  retries: number;
}
