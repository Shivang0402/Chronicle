const { before, after, beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { setup, teardown, clear, captureLogs } = require("./helper");
const app = require("../src/app");

const auth = (token) => ({ Authorization: `Bearer ${token}` });

let accountCount = 0;

const createAccount = async () => {
  accountCount += 1;
  const email = `writer${accountCount}@example.com`;
  const username = `writer${accountCount}`;
  const password = "password123";

  await captureLogs(() =>
    request(app).post("/api/auth/register").send({
      name: "Writer",
      username,
      email,
      password,
    }),
  );

  const session = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return session.body.token;
};

const createEntry = (token, body = {}) =>
  request(app)
    .post("/api/chronicle")
    .set(auth(token))
    .send({
      title: "Entry",
      content: "alpha beta gamma delta",
      mood: "happy",
      ...body,
    });

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

describe("chronicles", () => {
  before(setup);
  after(teardown);
  beforeEach(clear);

  it("creates a chronicle and rejects invalid input", async () => {
    const token = await createAccount();

    const created = await createEntry(token, {
      title: "First entry",
      tags: ["work"],
    });
    assert.equal(created.status, 201);
    assert.ok(created.body.chronicle._id);

    const shortContent = await createEntry(token, { content: "short" });
    assert.equal(shortContent.status, 400);

    const invalidDate = await createEntry(token, { date: "not-a-date" });
    assert.equal(invalidDate.status, 400);

    const invalidTags = await createEntry(token, { tags: "work" });
    assert.equal(invalidTags.status, 400);

    const anonymous = await request(app)
      .post("/api/chronicle")
      .send({ content: "alpha beta gamma delta" });
    assert.equal(anonymous.status, 401);
  });

  it("lists entries with pagination and sorting", async () => {
    const token = await createAccount();

    await createEntry(token, { title: "one", date: "2026-01-01" });
    await createEntry(token, { title: "two", date: "2026-01-02" });
    await createEntry(token, { title: "three", date: "2026-01-03" });

    const firstPage = await request(app)
      .get("/api/chronicle/getchronicles?limit=2&page=1")
      .set(auth(token));
    assert.equal(firstPage.status, 200);
    assert.equal(firstPage.body.totalChronicles, 3);
    assert.equal(firstPage.body.totalPages, 2);
    assert.deepEqual(
      firstPage.body.chronicles.map((entry) => entry.title),
      ["three", "two"],
    );

    const secondPage = await request(app)
      .get("/api/chronicle/getchronicles?limit=2&page=2")
      .set(auth(token));
    assert.equal(secondPage.body.chronicles.length, 1);
    assert.equal(secondPage.body.chronicles[0].title, "one");

    const oldestFirst = await request(app)
      .get("/api/chronicle/getchronicles?sort=oldest")
      .set(auth(token));
    assert.deepEqual(
      oldestFirst.body.chronicles.map((entry) => entry.title),
      ["one", "two", "three"],
    );
  });

  it("filters by mood, tag and date within the owner scope", async () => {
    const token = await createAccount();

    await createEntry(token, {
      title: "happy one",
      date: "2026-02-01",
      mood: "happy",
      tags: ["work"],
    });
    await createEntry(token, {
      title: "sad one",
      date: "2026-02-02",
      mood: "sad",
      tags: ["home"],
    });

    const byMood = await request(app)
      .get("/api/chronicle/getchronicles?mood=happy")
      .set(auth(token));
    assert.equal(byMood.body.totalChronicles, 1);
    assert.equal(byMood.body.chronicles[0].title, "happy one");

    const byTag = await request(app)
      .get("/api/chronicle/getchronicles?tag=home")
      .set(auth(token));
    assert.equal(byTag.body.chronicles[0].title, "sad one");

    const byDate = await request(app)
      .get("/api/chronicle/getchronicles?date=2026-02-01")
      .set(auth(token));
    assert.equal(byDate.body.totalChronicles, 1);

    const badDate = await request(app)
      .get("/api/chronicle/getchronicles?date=not-a-date")
      .set(auth(token));
    assert.equal(badDate.status, 400);

    const otherToken = await createAccount();
    const otherUser = await request(app)
      .get("/api/chronicle/getchronicles")
      .set(auth(otherToken));
    assert.equal(otherUser.body.totalChronicles, 0);
  });

  it("searches content, title and tags", async () => {
    const token = await createAccount();

    await createEntry(token, {
      title: "Groceries",
      content: "bought milk and bread today",
      tags: ["errand"],
    });
    await createEntry(token, {
      title: "Work",
      content: "finished the report",
      tags: ["office"],
    });

    const missingQuery = await request(app)
      .get("/api/chronicle/search")
      .set(auth(token));
    assert.equal(missingQuery.status, 400);

    const found = await request(app)
      .get("/api/chronicle/search?query=milk")
      .set(auth(token));
    assert.equal(found.status, 200);
    assert.equal(found.body.chronicle.length, 1);
    assert.equal(found.body.chronicle[0].title, "Groceries");

    const noMatch = await request(app)
      .get("/api/chronicle/search?query=nothing")
      .set(auth(token));
    assert.equal(noMatch.status, 404);
  });

  it("gets, updates and deletes entries only for their owner", async () => {
    const token = await createAccount();
    const created = await createEntry(token, { title: "Draft" });
    const id = created.body.chronicle._id;

    const fetched = await request(app)
      .get(`/api/chronicle/${id}`)
      .set(auth(token));
    assert.equal(fetched.status, 200);

    const badId = await request(app)
      .get("/api/chronicle/not-an-id")
      .set(auth(token));
    assert.equal(badId.status, 400);

    const updated = await request(app)
      .patch(`/api/chronicle/${id}`)
      .set(auth(token))
      .send({ title: "Final", content: "updated content here" });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.chronicle.title, "Final");

    const otherToken = await createAccount();
    assert.equal(
      (await request(app).get(`/api/chronicle/${id}`).set(auth(otherToken)))
        .status,
      404,
    );
    assert.equal(
      (
        await request(app)
          .patch(`/api/chronicle/${id}`)
          .set(auth(otherToken))
          .send({ title: "Hijacked" })
      ).status,
      404,
    );
    assert.equal(
      (await request(app).delete(`/api/chronicle/${id}`).set(auth(otherToken)))
        .status,
      404,
    );

    const deleted = await request(app)
      .delete(`/api/chronicle/${id}`)
      .set(auth(token));
    assert.equal(deleted.status, 200);

    const gone = await request(app)
      .get(`/api/chronicle/${id}`)
      .set(auth(token));
    assert.equal(gone.status, 404);
  });

  it("computes stats and streaks for the current user", async () => {
    const token = await createAccount();

    await createEntry(token, { date: daysAgo(0), mood: "happy" });
    await createEntry(token, { date: daysAgo(1), mood: "happy" });
    await createEntry(token, { date: daysAgo(2), mood: "sad" });

    const stats = await request(app)
      .get("/api/chronicle/stats")
      .set(auth(token));

    assert.equal(stats.status, 200);
    assert.equal(stats.body.totalChronicles, 3);
    assert.equal(stats.body.totalWords, 12);
    assert.equal(stats.body.averageWords, 4);
    assert.equal(stats.body.mostCommonMood, "happy");
    assert.equal(stats.body.currentStreak, 3);
    assert.equal(stats.body.longestStreak, 3);

    const now = new Date();
    const dates = [0, 1, 2].map((days) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date;
    });
    const thisMonth = dates.filter(
      (date) =>
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear(),
    ).length;
    const thisYear = dates.filter(
      (date) => date.getFullYear() === now.getFullYear(),
    ).length;

    assert.equal(stats.body.entriesThisMonth, thisMonth);
    assert.equal(stats.body.entriesThisYear, thisYear);
  });

  it("drops the current streak when the latest entry is old", async () => {
    const token = await createAccount();

    await createEntry(token, { date: daysAgo(6) });
    await createEntry(token, { date: daysAgo(5) });

    const stats = await request(app)
      .get("/api/chronicle/stats")
      .set(auth(token));

    assert.equal(stats.status, 200);
    assert.equal(stats.body.currentStreak, 0);
    assert.equal(stats.body.longestStreak, 2);
  });
});
