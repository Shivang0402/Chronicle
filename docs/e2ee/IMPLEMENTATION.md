# E2EE implementation status

## Current slice: browser crypto helpers

The crypto code is in two files to keep it easy to find:

- `frontend/src/lib/crypto.js` — key creation, Argon2id, AES-GCM encryption, and key wrapping.
- `frontend/src/lib/crypto.test.js` — focused tests with synthetic journal data.

The first KDF profile is Argon2id v1.3 with 64 MiB, 3 passes, and one lane. A Node/WASM benchmark on this desktop measured a 160 ms median over five runs. Browser and lower-end-device performance has not been measured yet, so revisit this profile before enabling E2EE setup for users.

The Master Key is extractable briefly during setup and then copied to a non-extractable, in-memory key for journal use. Entry date remains outside ciphertext and is authenticated as AES-GCM additional data. Existing plaintext entries were not changed or migrated.

## Not implemented yet

There is no setup or unlock UI, backend crypto metadata, encrypted journal API integration, local search/export replacement, or migration. The current app still uses its existing plaintext behavior.

## Validation

- `node --test frontend/src/lib/crypto.test.js` — 2 focused tests passed after simplifying.
- `npm run build` in `frontend/` succeeded before the crypto code was imported by app screens.
