import { Producer } from 'kafkajs';
import { IKafkaPublisher, IMongoClient } from '../../core/interfaces';
import KafkaError from '../errors/kafkaError';
import { logger } from '../logger';

export default class KafkaPublisher implements IKafkaPublisher {
  private topic: string;
  private producer: Producer;

  constructor(_producer: Producer, _topic: string) {
    this.producer = _producer;
    this.topic = _topic;
  }

  async connect(metadata?: any) {
    try {
      await this.producer.connect();
    } catch (error) {
      throw new KafkaError(error, metadata);
    }

    // let retryCount = 5;
    // try {
    //   this.producer.connect();
    // } catch (error) {
    //   if (retryCount > 0) {
    //     // retry connection every 5 minutes
    //     retryCount--;
    //     setTimeout(async () => {
    //       await this.producer.connect();
    //     }, 1000 * 10);
    //   } else {
    //     throw new KafkaError(error, metadata);
    //   }
    // }
  }

  async disconnect() {
    try {
      await this.producer.disconnect();
    } catch (error) {
      throw new KafkaError(error);
    }
  }

  async publish<T>(
    message: string,
    mongoClient?: IMongoClient<T>,
    retries?: number,
    key?: string
  ) {
    // not exactly null object pattern, but trying to handle if not topic is passed
    if (!this.topic) {
      throw new KafkaError('No topic passed', { retriable: false });
    }
    try {
      const result = await this.producer.send({
        topic: this.topic,
        messages: [{ value: message, key }],
      });
      logger.info(`Pushed data to Kafka, topic: ${this.topic}`);
      return result;
    } catch (error) {
      // * - We can use a DLQ (Dead letter queue) a topic that store kafka failed publishs
      // store this in mongodb
      if (mongoClient) {
        await mongoClient.pushToCollection(JSON.parse(message));
      }
      logger.error('Kafka publish failed: ' + error.message);
      // kafka is down, or some error
      throw new KafkaError('Kafka publish failed: ' + error.message, {
        topic: this.topic,
        retriable: true,
        retries: retries ?? 5, // This doesn't make any sense as we are retrying it in mongodb
      });
    }
  }
}
