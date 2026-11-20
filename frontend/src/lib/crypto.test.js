import assert from "node:assert/strict";
import test from "node:test";
import {
  createMasterKey,
  createPassphraseWrap,
  createRecoveryKey,
  createRecoveryWrap,
  createWorkingMasterKey,
  decryptEntry,
  encryptEntry,
  unlockWithPassphrase,
  unlockWithRecoveryKey,
} from "./crypto.js";

const context = { ownerId: "user-1", entryId: "entry-1", date: "2026-11-20" };

test("encrypted entries round-trip and detect changes", async () => {
  const key = await createWorkingMasterKey(await createMasterKey());
  assert.equal(key.extractable, false);
  const payload = { title: "Private title", content: "Synthetic journal content", mood: "calm", tags: ["sample"] };
  const envelope = await encryptEntry(key, payload, context);

  assert.deepEqual(await decryptEntry(key, envelope, context), payload);
  await assert.rejects(decryptEntry(key, envelope, { ...context, date: "2026-11-21" }));
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
});
