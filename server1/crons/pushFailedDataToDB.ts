import { logger } from '../utils';
import { IKafkaPublisher, IMongoClient, IReflow } from '../core/interfaces';

export async function pushFailedDataToDB(
  mongoClient: IMongoClient<IReflow>,
  kafkaPublisher: IKafkaPublisher
) {
  const retrievedData: IReflow[] = await mongoClient.getDataFromCollection({
    success: false, // db is indexed in success
    retries: { $gt: 0 },
  });

  let dbIds: string[] = [];
  if (retrievedData.length > 0) {
    await kafkaPublisher.connect();

    for (const data of retrievedData) {
      const message = JSON.stringify(data);
      try {
        await kafkaPublisher.publish(message);
        // would be easier if this was mongoose, would save for loop db call
        dbIds.push(data._id);
      } catch (error) {
        logger.error(
          `Failed to push id: ${data?._id}, processId: ${data?.processId} in cron`,
          error
        );
        await mongoClient.updateDataInCollection(
          { _id: data._id },
          { $inc: { retries: -1 } }
        );
      }
    }

    try {
      await mongoClient.updateDataInCollection(
        { _id: { $in: dbIds } },
        { $set: { success: true } }
      );
    } catch (error) {
      // alert
      console.log({
        message: 'Failed to update ids: ',
        ids: dbIds,
        error,
      });
    }

    await kafkaPublisher.disconnect();
  }

  // await mongoClient.disconnect();
  // Send Email on data pushed and data which is still failing
}
