import { Kafka } from 'kafkajs';
import constants from '../../core/constants';
import { kafkaTopics } from '../../core';

const kafka = new Kafka({
  clientId: 'server1',
  brokers: constants.BROKERS,
});

const admin = kafka.admin();

export async function createTopic() {
  await admin.connect();

  await admin.createTopics({
    topics: [
      {
        topic: kafkaTopics.MOVIE,
        numPartitions: 1,
        replicationFactor: 1,
        configEntries: [
          { name: 'retention.ms', value: '694800000' }, // Setting retention to 7 days
        ],
      },
    ],
  });

  await admin.disconnect();
}

export async function deleteTopic(topicName: string) {
  try {
    await admin.deleteTopics({
      topics: [topicName],
    });
    console.log(`Topic "${topicName}" deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting topic "${topicName}":`, error);
  } finally {
    await admin.disconnect();
  }
}

// createTopic().catch((error) => {
//   console.error('Error creating topic:', error);
// });

// deleteTopic('movie');
