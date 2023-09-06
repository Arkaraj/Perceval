import { RecordMetadata } from 'kafkajs';
import { IMongoClient } from './mongoClient';

export abstract class IKafkaPublisher {
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract publish(
    topic: string,
    message: string,
    mongoClient?: IMongoClient,
    key?: string
  ): Promise<RecordMetadata[]>;
}
