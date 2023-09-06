import { KafkaConfig } from 'kafkajs';
import { IKafkaPublisher } from './kafkaPublisher';

export interface IKafkaPublisherConfig extends KafkaConfig {}

export abstract class IKafkaPublisherFactory {
  abstract createPublisher(config: IKafkaPublisherConfig): IKafkaPublisher;
}
