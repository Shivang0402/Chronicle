const { before, after, beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { setup, teardown, clear, captureLogs, findToken } = require("./helper");
const app = require("../src/app");
const Chronicle = require("../src/models/chronicleModel");
const mongoose = require("mongoose");

const auth = (token) => ({ Authorization: `Bearer ${token}` });
const envelope = () => ({
  algorithm: "AES-256-GCM",
  version: 1,
  iv: Buffer.alloc(12).toString("base64url"),
  ciphertext: Buffer.alloc(48).toString("base64url"),
});
const encryptionMetadata = () => ({
  passphraseWrap: {
    metadataVersion: 1,
    kdf: {
      algorithm: "Argon2id",
      algorithmVersion: "1.3",
      memoryKiB: 65536,
      passes: 3,
      parallelism: 1,
      outputBytes: 32,
      salt: Buffer.alloc(16).toString("base64url"),
    },
    masterKey: envelope(),
  },
  recoveryWrap: envelope(),
});

let accountCount = 0;
const createAccount = async () => {
  accountCount += 1;
  const email = `writer${accountCount}@example.com`;
  const password = "password123";
  const logs = await captureLogs(() => request(app).post("/api/auth/register").send({
    name: "Writer",
    email,
    password,
  }));
  await request(app).get(`/api/auth/verify-email?token=${findToken(logs, "verify-email")}`);
  const session = await request(app).post("/api/auth/login").send({ email, password });
  return session.body.token;
};

const configureEncryption = (token) => request(app)
  .post("/api/e2ee/metadata")
  .set(auth(token))
  .send(encryptionMetadata());

const encryptedEntry = () => ({
  _id: new mongoose.Types.ObjectId().toString(),
  date: new Date().toISOString(),
  encryptedPayload: {
    algorithm: "AES-256-GCM",
    version: 1,
    iv: Buffer.alloc(12, 1).toString("base64url"),
    ciphertext: Buffer.alloc(18, 2).toString("base64url"),
  },
});

describe("encrypted chronicles", () => {
  before(setup);
  after(teardown);
  beforeEach(clear);

  it("stores and returns encrypted payloads without plaintext fields", async () => {
    const token = await createAccount();
    assert.equal((await configureEncryption(token)).status, 201);

    const entry = encryptedEntry();
    const created = await request(app).post("/api/chronicle").set(auth(token)).send(entry);
    assert.equal(created.status, 201);
    assert.equal(created.body.chronicle.encrypted, true);
    assert.equal(created.body.chronicle.title, undefined);
    assert.equal(created.body.chronicle.content, undefined);

    const listed = await request(app).get("/api/chronicle/getchronicles").set(auth(token));
    assert.equal(listed.status, 200);
    assert.equal(listed.body.chronicles.length, 1);
    assert.deepEqual(listed.body.chronicles[0].encryptedPayload, entry.encryptedPayload);

    const read = await request(app).get(`/api/chronicle/${entry._id}`).set(auth(token));
    assert.equal(read.status, 200);
    assert.equal(read.body.chronicle.content, undefined);
    assert.deepEqual(read.body.chronicle.encryptedPayload, entry.encryptedPayload);
  });

  it("requires encryption metadata and rejects plaintext entry writes", async () => {
    const token = await createAccount();
    const entry = encryptedEntry();
    assert.equal((await request(app).post("/api/chronicle").set(auth(token)).send(entry)).status, 409);
    assert.equal((await request(app).post("/api/chronicle").set(auth(token)).send({ content: "plaintext entry" })).status, 400);
  });

  it("accepts encrypted updates and rejects plaintext updates", async () => {
    const token = await createAccount();
    await configureEncryption(token);
    const entry = encryptedEntry();
    await request(app).post("/api/chronicle").set(auth(token)).send(entry);

    const encryptedPayload = { ...entry.encryptedPayload, ciphertext: Buffer.alloc(19, 3).toString("base64url") };
    const updated = await request(app).patch(`/api/chronicle/${entry._id}`).set(auth(token)).send({ encryptedPayload });
    assert.equal(updated.status, 200);
    assert.deepEqual(updated.body.chronicle.encryptedPayload, encryptedPayload);

    const plaintextUpdate = await request(app).patch(`/api/chronicle/${entry._id}`).set(auth(token)).send({ content: "plaintext update" });
    assert.equal(plaintextUpdate.status, 400);
  });

  it("removes legacy server-side search, export, and insight endpoints", async () => {
    const token = await createAccount();
    for (const path of ["search", "export", "stats", "moods", "tags"]) {
      const response = await request(app).get(`/api/chronicle/${path}`).set(auth(token));
      assert.notEqual(response.status, 200, `${path} should not be a server-side API`);
    }
  });

  it("creates indexes for owner-scoped archive lookups", async () => {
    await Chronicle.init();
    const indexes = await Chronicle.collection.indexes();
    const keys = indexes.map((index) => JSON.stringify(index.key));
    assert.ok(keys.includes(JSON.stringify({ user: 1, date: -1 })));
  });
});
