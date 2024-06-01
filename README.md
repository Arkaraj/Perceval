Fault-tolerance is one of the biggest concerns of distributed systems.

- circuit breaker on - rest api with secure middleware -> only for project not for real world

- try creating a decorator rather than a function for circuit breaker -> learning purpose

- reflow to kafka or mongo if create movie fails in server2

- we can use a dlq for kafka failed produces/consumes or push it to mongo and run cron.

- Note: This project does not have the perfect coding practises/folder structure this is just to implement circuit breaker and other fault tolerance tech.

## TODO:

- Fallback mechanism: Cache latest response of server2 when available (after some condition)
- Retries: If server 2 fails then retry for n number of times
- Implement circuit breaker in server 1 based on number of retries || request time taking to long or avg of n request response time
- Implement monitoring and alerts in server2 when down -> health check for server 2

- create a docker file which spins up server1, and server2 -> should have same kafka, mongodb, redis
