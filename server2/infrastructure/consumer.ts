import { Consumer, IHeaders, Kafka } from 'kafkajs';

export type Message<T = unknown> = {
  key: Buffer | null;
  timestamp: string;
  attributes: number;
  size?: number;
  headers?: IHeaders;
  body: T;
  topic?: string;
  offset?: string;
  partition?: number;
  consumer?: Consumer;
};
export type MessageProcessor<T = unknown> = (
  message: Message<T>
) => Promise<void>;

export class ConsumerService {
  private consumer: Consumer;
  constructor(private readonly kafka: Kafka) {}
  async susbcribe(
    groupId: string,
    messageHandler: {
      topic: string;
      messageProcessor: MessageProcessor<any>;
    }[]
  ) {
    this.consumer = this.kafka.consumer({ groupId });
    await this.consumer.connect();
    const topics = messageHandler.reduce((acc: string[], cur) => {
      acc.push(cur.topic);
      return acc;
    }, []);
    await this.consumer.subscribe({ topics, fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const config = messageHandler.find(
          (messageConfig) => messageConfig.topic == topic
        );
        if (config) {
          // add try catch here
          const body = JSON.parse(message.value?.toString() || '');
          return config.messageProcessor({
            key: message.key,
            attributes: message.attributes,
            timestamp: message.timestamp,
            headers: message.headers,
            size: message.size,
            body,
            partition,
            topic,
          });
        }
      },
    });
  }

  async disconnect() {
    try {
      await this.consumer.disconnect();
    } catch (error) {
      throw new Error(error);
    }
  }
}
