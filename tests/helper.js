process.env.JWT = "test-secret";
process.env.APP_URL = "http://localhost:4444";
delete process.env.SMTP_HOST;

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer;

const setup = async () => {
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri(), { dbName: "chronicle_test" });
};

const clear = async () => {
  const collections = mongoose.connection.collections;

  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
};

const teardown = async () => {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
  }
};

const captureLogs = async (action) => {
  const logs = [];
  const original = console.log;
  console.log = (...args) => logs.push(args.join(" "));

  try {
    await action();
  } finally {
    console.log = original;
  }

  return logs;
};

const findToken = (logs, path) => {
  const match = logs.join("\n").match(new RegExp(`${path}\\?token=([a-f0-9]+)`));

  return match ? match[1] : null;
};

module.exports = { setup, clear, teardown, captureLogs, findToken };
