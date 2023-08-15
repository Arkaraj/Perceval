export interface IMovie {
  id: string;
  name: string;
  director: string | string[];
  cast: string[];
  plot: string;
  runtime: number;
  release_data: Date;
  created?: boolean; // this is for reflows only
  processId?: string; // this is for reflows only
}

export interface IMovieRequest {
  name: string;
  director?: string | string[];
  cast?: string[];
  plot?: string;
  runtime?: number;
  release_data?: Date;
}
