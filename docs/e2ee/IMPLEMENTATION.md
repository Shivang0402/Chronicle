# E2EE implementation status

## Current slice: browser crypto helpers

The crypto refactor is in progress. The shared helpers now have their own file:

- `frontend/src/lib/crypto.utils.js` — shared settings, secure random bytes, UTF-8, and base64url helpers.
- `frontend/src/lib/keyManager.js` — Master Key lifecycle, Argon2id metadata/derivation, passphrase wraps, recovery wraps, and passphrase changes.
- `frontend/src/lib/entryCrypto.js` — journal payload encryption/decryption and entry AAD.
- `frontend/src/lib/crypto.test.js` — focused tests with synthetic journal data.

The three-module refactor is complete. Algorithms and entry AAD values are unchanged. Passphrase metadata now records the Argon2id version and exact supported parameters; changing the passphrase replaces only its wrap and preserves the recovery wrap.

The first KDF profile is Argon2id v1.3 with 64 MiB, 3 passes, and one lane. A Node/WASM benchmark on this desktop measured a 160 ms median over five runs. Browser and lower-end-device performance has not been measured yet, so revisit this profile before enabling E2EE setup for users.

The Master Key is extractable briefly during setup and then copied to a non-extractable, in-memory key for journal use. Entry date remains outside ciphertext and is authenticated as AES-GCM additional data. Existing plaintext entries were not changed or migrated.

## Not implemented yet

There is no setup or unlock UI, backend crypto metadata, encrypted journal API integration, local search/export replacement, or migration. The current app still uses its existing plaintext behavior.

## Validation

- `node --test frontend/src/lib/crypto.test.js` — 4 tests passed, covering entry round-trips, tampered ciphertext/AAD, wrong owner, incorrect passphrase/Recovery Key, and passphrase-change recovery continuity.
- `npm run build` in `frontend/` succeeded before the crypto code was imported by app screens.
