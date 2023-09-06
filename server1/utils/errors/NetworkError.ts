import { logger } from '../logger';
export default class NetworkError extends Error {
  public status: number;
  constructor(message: string | undefined, status: number) {
    logger.error('Network Error');
    super(message);
    this.name = 'NetworkError';
    this.status = status;
  }
}
