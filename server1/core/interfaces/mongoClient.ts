import { Filter, UpdateFilter, UpdateOptions } from 'mongodb';
import { IMovie } from './movie';

export abstract class IMongoClient {
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract pushToCollection(data: IMovie): Promise<void>;
  abstract getDataFromCollection(conditions: Filter<IMovie>): Promise<IMovie[]>;
  abstract updateDataInCollection(
    filter: Filter<IMovie>,
    update: UpdateFilter<IMovie> | Partial<IMovie>,
    options?: UpdateOptions | undefined
  ): Promise<void>;
}
