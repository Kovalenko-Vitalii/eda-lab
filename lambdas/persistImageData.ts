import { SQSHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: SQSHandler = async (event) => {
  console.log("Event ", JSON.stringify(event));

  for (const record of event.Records) {
    const recordBody = JSON.parse(record.body);        // Parse SQS message
    const snsMessage = JSON.parse(recordBody.Message); // Parse SNS message

    if (snsMessage.Records) {
      for (const s3Message of snsMessage.Records) {
        const s3e = s3Message.s3;
        const srcBucket = s3e.bucket.name;
        // Object key may have spaces or unicode non-ASCII characters.
        const srcKey = decodeURIComponent(s3e.object.key.replace(/\+/g, " "));
        try {
          await ddbDocClient.send(
            new PutCommand({
              TableName: process.env.TABLE_NAME,
              Item: {
                name: srcKey,
              },
            })
          );

          console.log(`Saved image metadata: ${srcKey} from ${srcBucket}`);
        } catch (error) {
          console.log(error);
        }
      }
      }
    }
};


function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });

  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };

  const unmarshallOptions = {
    wrapNumbers: false,
  };

  const translateConfig = { marshallOptions, unmarshallOptions };

  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
