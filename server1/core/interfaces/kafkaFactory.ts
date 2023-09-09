import { KafkaConfig } from 'kafkajs';
import { IKafkaPublisher } from './kafkaPublisher';

export enum kafkaTopics {
  MOVIE = 'movie',
}

export interface IKafkaPublisherConfig extends KafkaConfig {}

export abstract class IKafkaPublisherFactory {
  abstract createPublisher(
    config: IKafkaPublisherConfig,
    topic: kafkaTopics
  ): IKafkaPublisher;
}
