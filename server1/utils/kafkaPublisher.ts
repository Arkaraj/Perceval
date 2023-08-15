import { Kafka, Producer, RecordMetadata } from 'kafkajs';
import MongoDBClient from './mongoClient';
// import constants from '../constants';
// const {DB_URI, DB_NAME, REFLOW_COLLECTION} = constants;

// const mongoClient = new MongoDBClient(DB_URI, DB_NAME, REFLOW_COLLECTION);

export default class KafkaPublisher {
  private producer: Producer;

  constructor(brokers: string[]) {
    const kafka = new Kafka({ brokers });
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  async publish(
    topic: string,
    message: string,
    mongoClient?: MongoDBClient,
    key?: string
  ): Promise<RecordMetadata[]> {
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
