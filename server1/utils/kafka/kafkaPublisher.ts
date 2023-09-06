import { Producer } from 'kafkajs';
import { IKafkaPublisher, IMongoClient } from '../../core/interfaces';

export default class KafkaPublisher implements IKafkaPublisher {
  private producer: Producer;

  constructor(_producer: Producer) {
    this.producer = _producer;
  }

  async connect() {
    await this.producer.connect();
  }

  async disconnect() {
    await this.producer.disconnect();
  }

  async publish(
    topic: string,
    message: string,
    mongoClient?: IMongoClient,
    key?: string
  ) {
    try {
      const result = await this.producer.send({
        topic,
        messages: [{ value: message, key }],
      });

      return result;
    } catch (error) {
      // store this in mongodb
      if (mongoClient) {
        await mongoClient.connect();
        await mongoClient.pushToCollection(JSON.parse(message));
        await mongoClient.disconnect();
      }
      console.log('Kafka publish failed: ' + error.message);
      throw new Error('Kafka publish failed: ' + error.message);
    }
  }
}
