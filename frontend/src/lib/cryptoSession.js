let currentSession = null;

export function setEncryptionSession(ownerId, masterKey) {
  if (typeof ownerId !== "string" || !masterKey) {
    throw new TypeError("Encryption session requires an account and master key");
  }
  currentSession = { ownerId, masterKey };
}

export function getEncryptionKey(ownerId) {
  return currentSession?.ownerId === ownerId ? currentSession.masterKey : null;
}

export function clearEncryptionSession() {
  currentSession = null;
}
