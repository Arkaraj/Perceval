import constants from '../core/constants';
import { IKafkaPublisher, IMongoClient, IMovie } from '../core/interfaces';

export async function pushFailedDataToDB(
  mongoClient: IMongoClient,
  kafkaPublisher: IKafkaPublisher
) {
  await mongoClient.connect();

  const retrievedData: IMovie[] = await mongoClient.getDataFromCollection({
    created: false,
  });

  if (retrievedData.length > 0) {
    await kafkaPublisher.connect();

    for (const data of retrievedData) {
      const message = JSON.stringify(data);
      await kafkaPublisher.publish(constants.KAFKA_TOPIC, message);
      // would be easier if this was mongoose, would save for loop db call
      await mongoClient.updateDataInCollection(
        { _id: data._id },
        { created: true }
      );
      console.log('Pushed data to Kafka:', message);
    }

    await kafkaPublisher.disconnect();
  }

  await mongoClient.disconnect();
}
