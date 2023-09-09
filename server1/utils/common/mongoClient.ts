import {
  MongoClient,
  Collection,
  Filter,
  UpdateFilter,
  UpdateOptions,
  MongoError,
  OptionalUnlessRequiredId,
  WithId,
  Document,
} from 'mongodb';
import { IMongoClient } from '../../core/interfaces';
import { logger } from '../../utils/logger';

export class MongoDBClient<T extends Document> implements IMongoClient<T> {
  private client: MongoClient;
  private collection: Collection<T>;

  constructor(uri: string, dbName: string, collectionName: string) {
    this.client = new MongoClient(uri);
    this.collection = this.client.db(dbName).collection(collectionName);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error({ message: 'Failed to connect to mongodb', error });
      throw new MongoError(error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.close();
    } catch (error) {
      logger.error({ message: 'Failed to disconnect to mongodb', error });
      throw new MongoError(error);
    }
  }

  async pushToCollection(data: OptionalUnlessRequiredId<T>): Promise<void> {
    try {
      await this.collection.insertOne(data);
    } catch (error) {
      throw new Error('Failed to push data to collection: ' + error.message);
    }
  }

  async getDataFromCollection(conditions: Filter<T>): Promise<WithId<T>[]> {
    try {
      const cursor = this.collection.find(conditions);
      return await cursor.toArray();
    } catch (error) {
      throw new Error('Failed to get data from collection: ' + error.message);
    }
  }

  async updateDataInCollection(
    filter: Filter<T>,
    update: UpdateFilter<T> | Partial<T>,
    options?: UpdateOptions | undefined
  ): Promise<void> {
    try {
      await this.collection.updateMany(filter, update, options);
    } catch (error) {
      // console.log('hrerere: ', error);
      throw new Error('Failed to update data: ' + error.message);
    }
  }
}
