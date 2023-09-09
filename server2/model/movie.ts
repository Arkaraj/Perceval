import config from '../config';
import { Schema, model } from 'mongoose';

export interface IMovie {
  name: string;
  director: string | string[];
  cast: string[];
  plot: string;
  runtime: number;
  release_data: Date;
}

const MovieSchema: Schema<IMovie> = new Schema(
  {
    name: { type: String, required: true },
    director: [{ type: String }],
    cast: [{ type: String }],
    plot: { type: String },
    runtime: { type: Number },
    release_data: { type: Date },
  },
  {
    minimize: true,
    timestamps: true,
  }
);

// Caching + indexing can be overkill, plus indexing increases a lot of size
MovieSchema.index(
  { name: 1 },
  { comment: 'This is for faster namewise searches' }
);

const MovieModel = model(config.MONGO_MOVIES_DB, MovieSchema);

export default MovieModel;
