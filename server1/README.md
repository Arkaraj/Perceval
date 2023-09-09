# SERVER 1

I am not using a DLQ (it is a topic for kafka failes/errors while publishing) as i would have had to build an UI to view/monitor the dlqs.

- Requeue and retries

## Retry mechanism ->

- the momment circuit breaker is in open state -> reflow all the failed/unsent data
- retry everyday till its retries are 0 (cron jobs)

console.logs >>> pino
