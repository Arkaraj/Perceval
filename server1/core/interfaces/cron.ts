export abstract class ICronJob {
  abstract start(cronJob: any, schedule: string): void;
}
