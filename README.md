- circuit breaker on - rest api with secure middleware -> only for project not for real world

- try creating a decorator rather than a function for circuit breaker -> learning purpose

- reflow to kafka or mongo if create movie fails in server2

- we can use a dlq for kafka failed produces/consumes or push it to mongo and run cron.

- Note: This project does not have the perfect coding practises/folder structure this is just to implement circuit breaker and other fault tolerance tech.
