import { IMovie } from './movie';

export interface IReflow {
  _id: string;
  data: IMovie;
  processId: string;
  success: boolean; // index this
  retries: number; // number of retries
}
