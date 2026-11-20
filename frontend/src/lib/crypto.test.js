import assert from "node:assert/strict";
import test from "node:test";
import { fromBase64Url, randomBytes, toBase64Url, utf8Decode, utf8Encode } from "./crypto.utils.js";
import {
  changePassphrase,
  createMasterKey,
  createPassphraseWrap,
  createRecoveryKey,
  createRecoveryWrap,
  createWorkingMasterKey,
  unlockWithPassphrase,
  unlockWithRecoveryKey,
} from "./keyManager.js";
import { decryptEntry, encryptEntry } from "./entryCrypto.js";

const context = { ownerId: "user-1", entryId: "entry-1", date: "2026-11-20" };

test("crypto utilities round-trip encoded values and reject malformed encodings", () => {
  const bytes = randomBytes(32);
  assert.deepEqual(fromBase64Url(toBase64Url(bytes)), bytes);
  assert.equal(utf8Decode(utf8Encode("Chronicle ✓")), "Chronicle ✓");
  assert.throws(() => fromBase64Url("not valid!"));
  assert.throws(() => randomBytes(0));
});

test("encrypted entries round-trip and detect changes", async () => {
  const key = await createWorkingMasterKey(await createMasterKey());
  assert.equal(key.extractable, false);
  const payload = { title: "Private title", content: "Synthetic journal content", mood: "calm", tags: ["sample"] };
  const envelope = await encryptEntry(key, payload, context);

  assert.deepEqual(await decryptEntry(key, envelope, context), payload);
  await assert.rejects(decryptEntry(key, envelope, { ...context, date: "2026-11-21" }));
  await assert.rejects(decryptEntry(key, envelope, { ...context, ownerId: "another-user" }));
  const changedCiphertext = `${envelope.ciphertext.slice(0, -1)}${envelope.ciphertext.endsWith("A") ? "B" : "A"}`;
  await assert.rejects(decryptEntry(key, { ...envelope, ciphertext: changedCiphertext }, context));
});

test("passphrase and Recovery Key wraps unlock the same Master Key", async () => {
  const setupKey = await createMasterKey();
  const passphraseWrap = await createPassphraseWrap(setupKey, "sample passphrase", context.ownerId);
  const byPassphrase = await unlockWithPassphrase("sample passphrase", context.ownerId, passphraseWrap);
  const recoveryKey = createRecoveryKey();
  const recoveryWrap = await createRecoveryWrap(setupKey, recoveryKey, context.ownerId);
  const byRecoveryKey = await unlockWithRecoveryKey(recoveryKey, context.ownerId, recoveryWrap);

  const payload = { title: "Same key", content: "Both wraps work" };
  const envelope = await encryptEntry(setupKey, payload, context);
  assert.deepEqual(await decryptEntry(byPassphrase, envelope, context), payload);
  assert.deepEqual(await decryptEntry(byRecoveryKey, envelope, context), payload);
  await assert.rejects(unlockWithPassphrase("wrong passphrase", context.ownerId, passphraseWrap));
  await assert.rejects(unlockWithPassphrase("sample passphrase", "another-user", passphraseWrap));
  await assert.rejects(unlockWithRecoveryKey(createRecoveryKey(), context.ownerId, recoveryWrap));
});

test("passphrase change keeps the same Master Key and preserves recovery access", async () => {
  const setupKey = await createMasterKey();
  const recoveryKey = createRecoveryKey();
  const keyMetadata = {
    passphraseWrap: await createPassphraseWrap(setupKey, "old passphrase", context.ownerId),
    recoveryWrap: await createRecoveryWrap(setupKey, recoveryKey, context.ownerId),
  };
  const updated = await changePassphrase("old passphrase", "new passphrase", context.ownerId, keyMetadata);

  assert.strictEqual(updated.recoveryWrap, keyMetadata.recoveryWrap);
  await assert.rejects(unlockWithPassphrase("old passphrase", context.ownerId, updated.passphraseWrap));

  const payload = { title: "Still the same key", content: "Existing entries remain readable" };
  const envelope = await encryptEntry(setupKey, payload, context);
  const byNewPassphrase = await unlockWithPassphrase("new passphrase", context.ownerId, updated.passphraseWrap);
  const byRecoveryKey = await unlockWithRecoveryKey(recoveryKey, context.ownerId, updated.recoveryWrap);
  assert.deepEqual(await decryptEntry(byNewPassphrase, envelope, context), payload);
  assert.deepEqual(await decryptEntry(byRecoveryKey, envelope, context), payload);
});
