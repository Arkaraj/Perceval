import { Schema, model } from 'mongoose';

export interface IMovie {
  name: string;
  director: string | string[];
  cast: string[];
  plot: string;
  runtime: number;
  release_data: Date;
  created?: boolean; // this is for reflows only
  processId?: string; // this is for reflows only
}

const MovieSchema: Schema<IMovie> = new Schema(
  {
    name: { type: String, required: true },
  },
  {
    minimize: true,
    timestamps: true,
  }
);

// TODO: place movies to constants
const MovieModel = model('movies', MovieSchema);

export default MovieModel;
