import { SQSHandler } from "aws-lambda";

export const handler: SQSHandler = async (event) => {
  console.log("Event ", JSON.stringify(event));

  for (const record of event.Records) {
    const recordBody = JSON.parse(record.body);

    if (recordBody.Records) {
      for (const s3Message of recordBody.Records) {
        const srcKey = decodeURIComponent(
          s3Message.s3.object.key.replace(/\+/g, " ")
        );
        console.log("Rejected file: ", srcKey);
      }
    }
  }
};