import {
  Filter,
  OptionalUnlessRequiredId,
  UpdateFilter,
  UpdateOptions,
  WithId,
} from 'mongodb';

export abstract class IMongoClient<T> {
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract pushToCollection(data: OptionalUnlessRequiredId<T>): Promise<void>;
  abstract getDataFromCollection(conditions: Filter<T>): Promise<WithId<T>[]>;
  abstract updateDataInCollection(
    filter: Filter<T>,
    update: UpdateFilter<T> | Partial<T>,
    options?: UpdateOptions | undefined
  ): Promise<void>;
}
