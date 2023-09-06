import { ICronJob } from '../../core/interfaces';
import cron from 'node-cron';

export class CronJob implements ICronJob {
  start(cronJob: any, schedule: string = '0 1 * * *') {
    // Run the job every night at 1am
    cron.schedule(schedule, async () => {
      try {
        await cronJob();
      } catch (error) {
        console.error('Cron Error: ', error);
      }
    });
  }
}
