import {
  MongoClient,
  Collection,
  Filter,
  UpdateFilter,
  UpdateOptions,
} from 'mongodb';
import { IMovie } from '../interfaces';

export default class MongoDBClient {
  private client: MongoClient;
  private collection: Collection<IMovie>;

  constructor(uri: string, dbName: string, collectionName: string) {
    this.client = new MongoClient(uri);
    this.collection = this.client.db(dbName).collection(collectionName);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  async pushToCollection(data: IMovie): Promise<void> {
    try {
      await this.collection.insertOne(data);
    } catch (error) {
      throw new Error('Failed to push data to collection: ' + error.message);
    }
  }

  async getDataFromCollection(conditions: Filter<IMovie>): Promise<IMovie[]> {
    try {
      const cursor = this.collection.find(conditions);
      const data: IMovie[] = await cursor.toArray();
      return data;
    } catch (error) {
      throw new Error('Failed to get data from collection: ' + error.message);
    }
  }

  async updateDataInCollection(
    filter: Filter<IMovie>,
    update: UpdateFilter<IMovie> | Partial<IMovie>,
    options?: UpdateOptions | undefined
  ): Promise<void> {
    try {
      await this.collection.updateOne(filter, update, options);
    } catch (error) {
      throw new Error('Failed to update data: ' + error.message);
    }
  }
}
