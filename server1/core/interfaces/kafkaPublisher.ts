import { RecordMetadata } from 'kafkajs';
import { IMongoClient } from './mongoClient';

export abstract class IKafkaPublisher {
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract publish<T>(
    message: string,
    mongoClient?: IMongoClient<T>,
    retries?: number,
    key?: string
  ): Promise<RecordMetadata[]>;
}
