import { Kafka } from 'kafkajs';
import KafkaPublisher from './kafkaPublisher';
import {
  IKafkaPublisher,
  IKafkaPublisherConfig,
  IKafkaPublisherFactory,
  kafkaTopics,
} from '../../core/interfaces';

export class KafkaPublisherFactory implements IKafkaPublisherFactory {
  private static instance: KafkaPublisherFactory;
  private constructor() {}

  // Singleton pattern to ensure there's only one factory instance
  static getInstance(): IKafkaPublisherFactory {
    if (!this.instance) {
      this.instance = new KafkaPublisherFactory();
    }
    return this.instance;
  }

  // Create a KafkaPublisher instance with the provided configuration
  createPublisher(
    config: IKafkaPublisherConfig,
    topic: kafkaTopics
  ): IKafkaPublisher {
    const kafka: Kafka = new Kafka(config);
    const producer = kafka.producer();
    if (topic == kafkaTopics.MOVIE) {
      return new KafkaPublisher(producer, topic);
    } else {
      // by default pass in something, don't break here, sending default MOVIE topic
      return new KafkaPublisher(producer, kafkaTopics.MOVIE);
    }
  }
}
