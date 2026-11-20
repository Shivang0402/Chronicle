# E2EE implementation status

## Current slice: browser crypto helpers

The crypto refactor is in progress. The shared helpers now have their own file:

- `frontend/src/lib/crypto.utils.js` — shared settings, secure random bytes, UTF-8, and base64url helpers.
- `frontend/src/lib/crypto.js` — existing key and entry operations; it will be split into `keyManager.js` and `entryCrypto.js` in the next approved steps.
- `frontend/src/lib/crypto.test.js` — focused tests with synthetic journal data.

The first refactoring step is complete. The existing crypto flows now use the shared utility functions; their algorithms and AAD values are unchanged.

The first KDF profile is Argon2id v1.3 with 64 MiB, 3 passes, and one lane. A Node/WASM benchmark on this desktop measured a 160 ms median over five runs. Browser and lower-end-device performance has not been measured yet, so revisit this profile before enabling E2EE setup for users.

The Master Key is extractable briefly during setup and then copied to a non-extractable, in-memory key for journal use. Entry date remains outside ciphertext and is authenticated as AES-GCM additional data. Existing plaintext entries were not changed or migrated.

## Not implemented yet

There is no setup or unlock UI, backend crypto metadata, encrypted journal API integration, local search/export replacement, or migration. The current app still uses its existing plaintext behavior.

## Validation

- `node --test frontend/src/lib/crypto.test.js` — 3 focused tests passed after extracting the utility module.
- `npm run build` in `frontend/` succeeded before the crypto code was imported by app screens.
