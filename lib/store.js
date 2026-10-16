
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  TransactWriteCommand,
} = require("@aws-sdk/lib-dynamodb");

const data = require("../data.json");

const tableName = process.env.AWS_DYNAMODB_TABLE;
const region = process.env.AWS_REGION || "ap-southeast-1";

if (!tableName) {
  throw new Error("Missing AWS_DYNAMODB_TABLE");
}

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region })
);

async function list() {
  const result = await client.send(
    new ScanCommand({
      TableName: tableName,
      ConsistentRead: true,
    })
  );

  const selections = (result.Items || [])
    .filter((item) => item.entity === "SELECTION")
    .map((item) => item.record)
    .filter(Boolean);

  return { ok: true, demo: false, selections };
}

async function add(record) {
  const time = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const savedRecord = { ...record, time };

  try {
    await client.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: tableName,
              Item: {
                id: `TOPIC#${record.topicId}`,
                entity: "SELECTION",
                record: savedRecord,
              },
              ConditionExpression: "attribute_not_exists(id)",
            },
          },
          {
            Put: {
              TableName: tableName,
              Item: {
                id: `TEAM#${record.nhom}-${record.to}`,
                entity: "TEAM_LOCK",
                topicId: record.topicId,
                time,
              },
              ConditionExpression: "attribute_not_exists(id)",
            },
          },
        ],
      })
    );

    return {
      ok: true,
      demo: false,
      selections: await list().then((r) => r.selections),
    };
  } catch (error) {
    if (error.name === "TransactionCanceledException") {
      const current = await list();
      const topicTaken = current.selections.some(
        (s) => s.topicId === record.topicId
      );
      const teamTaken = current.selections.some(
        (s) => s.nhom === record.nhom && s.to === record.to
      );

      if (topicTaken) {
        return {
          ok: false,
          code: "TOPIC_TAKEN",
          error: "Đề tài này vừa được tổ khác chọn.",
          selections: current.selections,
        };
      }

      if (teamTaken) {
        return {
          ok: false,
          code: "TEAM_DONE",
          error: "Tổ của bạn đã chọn đề tài rồi.",
          selections: current.selections,
        };
      }
    }

    console.error("DynamoDB write failed:", error.name);

    return {
      ok: false,
      error: "Không thể ghi nhận lựa chọn. Vui lòng thử lại.",
    };
  }
}

module.exports = { data, list, add };
