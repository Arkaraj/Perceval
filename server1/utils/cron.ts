import cron from 'node-cron';

export default class CronJob {
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
