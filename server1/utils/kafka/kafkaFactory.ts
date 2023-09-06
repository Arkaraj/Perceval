import { Kafka } from 'kafkajs';
import KafkaPublisher from './kafkaPublisher';
import {
  IKafkaPublisherConfig,
  IKafkaPublisherFactory,
} from '../../core/interfaces';

export class KafkaPublisherFactory implements IKafkaPublisherFactory {
  private static instance: KafkaPublisherFactory;

  private constructor() {}

  // Singleton pattern to ensure there's only one factory instance
  static getInstance(): KafkaPublisherFactory {
    if (!this.instance) {
      this.instance = new KafkaPublisherFactory();
    }
    return this.instance;
  }

  // Create a KafkaPublisher instance with the provided configuration
  createPublisher(config: IKafkaPublisherConfig) {
    const kafka: Kafka = new Kafka(config);
    const producer = kafka.producer();
    return new KafkaPublisher(producer);
  }
}
