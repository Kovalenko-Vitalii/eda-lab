import { SQSHandler } from "aws-lambda";

export const handler: SQSHandler = async (event) => {
  console.log("Event ", JSON.stringify(event));

  for (const record of event.Records) {
    const recordBody = JSON.parse(record.body);
    const snsMessage = JSON.parse(recordBody.Message); 

    if (snsMessage.Records) {
      for (const s3Message of snsMessage.Records) {
        const srcKey = decodeURIComponent(
          s3Message.s3.object.key.replace(/\+/g, " ")
        );
        console.log("Rejected file: ", srcKey);
      }
    }
  }
};