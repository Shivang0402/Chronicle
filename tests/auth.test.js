const { before, after, beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { setup, teardown, clear, captureLogs, findToken } = require("./helper");
const app = require("../src/app");
const User = require("../src/models/userModel");

const credentials = {
  name: "Test User",
  username: "testuser",
  email: "test@example.com",
  password: "password123",
};

const register = (body = credentials) =>
  request(app).post("/api/auth/register").send(body);

const registerQuiet = async (body = credentials) => {
  let result;
  await captureLogs(async () => {
    result = await register(body);
  });
  return result;
};

const verifyEmail = (logs) =>
  request(app).get(
    `/api/auth/verify-email?token=${findToken(logs, "verify-email")}`,
  );

const registerVerified = async (body = credentials) => {
  let result;
  const logs = await captureLogs(async () => {
    result = await register(body);
  });
  await verifyEmail(logs);
  return result;
};

const login = (body) => request(app).post("/api/auth/login").send(body);

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe("auth", () => {
  before(setup);
  after(teardown);
  beforeEach(clear);

  it("registers a user with a hashed password and a verification token", async () => {
    let res;
    await captureLogs(async () => {
      res = await register();
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.user.email, credentials.email);
    assert.equal(res.body.user.password, undefined);

    const user = await User.findOne({ email: credentials.email }).select(
      "+password +emailVerificationToken +emailVerificationExpires",
    );

    assert.ok(user);
    assert.notEqual(user.password, credentials.password);
    assert.equal(user.isEmailVerified, false);
    assert.ok(user.emailVerificationToken);
    assert.ok(user.emailVerificationExpires.getTime() > Date.now());
  });

  it("rejects invalid registrations", async () => {
    const shortPassword = await register({
      ...credentials,
      password: "short",
    });
    assert.equal(shortPassword.status, 400);

    await registerQuiet();

    const duplicateEmail = await register({
      ...credentials,
      username: "anotheruser",
    });
    assert.equal(duplicateEmail.status, 400);

    const duplicateUsername = await register({
      ...credentials,
      email: "another@example.com",
    });
    assert.equal(duplicateUsername.status, 400);
  });

  it("verifies an email with a single-use token", async () => {
    let registered;
    const logs = await captureLogs(async () => {
      registered = await register();
    });
    assert.equal(registered.status, 201);

    const token = findToken(logs, "verify-email");
    assert.ok(token);

    const invalid = await request(app).get(
      "/api/auth/verify-email?token=not-a-real-token",
    );
    assert.equal(invalid.status, 400);

    const verified = await request(app).get(
      `/api/auth/verify-email?token=${token}`,
    );
    assert.equal(verified.status, 200);

    const user = await User.findOne({ email: credentials.email }).select(
      "+emailVerificationToken",
    );
    assert.equal(user.isEmailVerified, true);
    assert.equal(user.emailVerificationToken, undefined);

    const reused = await request(app).get(
      `/api/auth/verify-email?token=${token}`,
    );
    assert.equal(reused.status, 400);
  });

  it("resends verification without leaking account existence", async () => {
    await registerQuiet();

    const logs = await captureLogs(() =>
      request(app)
        .post("/api/auth/resend-verification")
        .send({ email: credentials.email }),
    );
    assert.ok(findToken(logs, "verify-email"));

    const unknown = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: "nobody@example.com" });
    assert.equal(unknown.status, 200);
    assert.match(unknown.body.message, /If an unverified account/);
  });

  it("blocks login until the email is verified", async () => {
    let registered;
    const logs = await captureLogs(async () => {
      registered = await register();
    });
    assert.equal(registered.status, 201);

    const blocked = await login({
      email: credentials.email,
      password: credentials.password,
    });
    assert.equal(blocked.status, 403);
    assert.match(blocked.body.message, /verify your email/i);

    await verifyEmail(logs);

    const allowed = await login({
      email: credentials.email,
      password: credentials.password,
    });
    assert.equal(allowed.status, 200);
    assert.ok(allowed.body.token);
  });

  it("logs in and reads the authenticated profile", async () => {
    await registerVerified();

    const wrong = await login({
      email: credentials.email,
      password: "wrongpassword",
    });
    assert.equal(wrong.status, 401);

    const res = await login({
      email: credentials.email,
      password: credentials.password,
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);

    const profile = await request(app)
      .get("/api/auth/profile")
      .set(auth(res.body.token));
    assert.equal(profile.status, 200);
    assert.equal(profile.body.user.email, credentials.email);
    assert.equal(profile.body.user.password, undefined);

    const anonymous = await request(app).get("/api/auth/profile");
    assert.equal(anonymous.status, 401);
  });

  it("resets a password through an emailed single-use token", async () => {
    await registerVerified();

    const logs = await captureLogs(() =>
      request(app)
        .post("/api/auth/forgot-password")
        .send({ email: credentials.email }),
    );
    const token = findToken(logs, "reset-password");
    assert.ok(token);

    const unknown = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "nobody@example.com" });
    assert.equal(unknown.status, 200);

    const invalid = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: "not-a-real-token", password: "newpassword1" });
    assert.equal(invalid.status, 400);

    const short = await request(app)
      .post("/api/auth/reset-password")
      .send({ token, password: "short" });
    assert.equal(short.status, 400);

    const reset = await request(app)
      .post("/api/auth/reset-password")
      .send({ token, password: "newpassword1" });
    assert.equal(reset.status, 200);

    const oldPassword = await login({
      email: credentials.email,
      password: credentials.password,
    });
    assert.equal(oldPassword.status, 401);

    const newPassword = await login({
      email: credentials.email,
      password: "newpassword1",
    });
    assert.equal(newPassword.status, 200);

    const reused = await request(app)
      .post("/api/auth/reset-password")
      .send({ token, password: "anotherpassword1" });
    assert.equal(reused.status, 400);
  });

  it("changes the password for a logged-in user", async () => {
    await registerVerified();
    const session = await login({
      email: credentials.email,
      password: credentials.password,
    });
    const token = session.body.token;

    const anonymous = await request(app)
      .patch("/api/auth/change-password")
      .send({
        currentPassword: credentials.password,
        newPassword: "newpassword1",
      });
    assert.equal(anonymous.status, 401);

    const wrong = await request(app)
      .patch("/api/auth/change-password")
      .set(auth(token))
      .send({
        currentPassword: "wrongpassword",
        newPassword: "newpassword1",
      });
    assert.equal(wrong.status, 401);

    const same = await request(app)
      .patch("/api/auth/change-password")
      .set(auth(token))
      .send({
        currentPassword: credentials.password,
        newPassword: credentials.password,
      });
    assert.equal(same.status, 400);

    const short = await request(app)
      .patch("/api/auth/change-password")
      .set(auth(token))
      .send({ currentPassword: credentials.password, newPassword: "short" });
    assert.equal(short.status, 400);

    const changed = await request(app)
      .patch("/api/auth/change-password")
      .set(auth(token))
      .send({
        currentPassword: credentials.password,
        newPassword: "newpassword1",
      });
    assert.equal(changed.status, 200);

    const oldPassword = await login({
      email: credentials.email,
      password: credentials.password,
    });
    assert.equal(oldPassword.status, 401);

    const newPassword = await login({
      email: credentials.email,
      password: "newpassword1",
    });
    assert.equal(newPassword.status, 200);
  });
});
