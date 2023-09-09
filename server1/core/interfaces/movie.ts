export interface IMovie {
  _id: string;
  name: string;
  director: string | string[];
  cast: string[];
  plot: string;
  runtime: number;
  release_data: Date;
}

export interface IMovieRequest {
  name: string;
  director?: string | string[];
  cast?: string[];
  plot?: string;
  runtime?: number;
  release_data?: Date;
}
