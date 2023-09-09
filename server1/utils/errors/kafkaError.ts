import { logger } from '../logger';

type KafkaErrorMetaData = {
  topic?: string;
  partionId?: string;
  retriable?: boolean;
  retries?: number;
};

export default class KafkaError extends Error {
  readonly metadata?: KafkaErrorMetaData;
  constructor(message: string | undefined, metadata?: KafkaErrorMetaData) {
    logger.error('Kafka Error');
    super(message);
    this.name = 'KafkaError';
    this.metadata = metadata;
  }
}
