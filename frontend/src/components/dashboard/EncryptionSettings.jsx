import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { e2eeApi } from "../../lib/api";
import { getEncryptionKey } from "../../lib/cryptoSession.js";
import {
  changePassphrase as rewrapPassphrase,
  createRecoveryKey,
  createRecoveryWrap,
  unlockWithPassphrase,
} from "../../lib/keyManager.js";

const emptyPassphraseForm = { current: "", next: "", confirm: "" };

function SettingsRow({ label, value, detail, action }) {
  return (
    <div className="grid gap-2 py-5 sm:grid-cols-[minmax(150px,0.32fr)_minmax(0,1fr)] sm:gap-8">
      <div>
        <p className="text-[13px] font-medium text-charcoal">{label}</p>
        {detail ? (
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-gray">
            {detail}
          </p>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <span className="break-words text-[14px] text-charcoal-muted">
          {value}
        </span>
        {action}
      </div>
    </div>
  );
}

function TextAction({ children, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="border-b border-sage/50 pb-0.5 text-[13px] font-medium text-sage-dark transition-colors hover:border-sage hover:text-charcoal disabled:cursor-wait disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export default function EncryptionSettings({ token, ownerId, onNotice }) {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [passphraseOpen, setPassphraseOpen] = useState(false);
  const [form, setForm] = useState(emptyPassphraseForm);
  const [rotating, setRotating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [recoveryDraft, setRecoveryDraft] = useState(null);
  const [savedAcknowledged, setSavedAcknowledged] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    e2eeApi
      .getMetadata(token)
      .then((result) => {
        if (active) setMetadata(result);
      })
      .catch((failure) => {
        if (active)
          setLoadError(failure?.message || "Could not load encryption settings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const updateForm = (event) =>
    setForm((value) => ({ ...value, [event.target.name]: event.target.value }));

  const saveMetadata = async (nextMetadata) => {
    const result = await e2eeApi.updateMetadata(
      {
        passphraseWrap: nextMetadata.passphraseWrap,
        recoveryWrap: nextMetadata.recoveryWrap,
      },
      nextMetadata.revision,
      token,
    );
    setMetadata(result);
    return result;
  };

  const changePassphrase = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (form.next.length < 12)
      return setError("Choose an encryption passphrase with at least 12 characters.");
    if (form.next !== form.confirm)
      return setError("The new passphrases do not match.");
    if (form.current === form.next)
      return setError("Choose a different passphrase.");
    if (!metadata?.metadata || !getEncryptionKey(ownerId))
      return setError("Unlock your Chronicle before changing its encryption settings.");
    setBusy(true);
    try {
      const updatedMetadata = await rewrapPassphrase(
        form.current,
        form.next,
        ownerId,
        metadata.metadata,
      );
      await saveMetadata({ ...updatedMetadata, revision: metadata.metadata.revision });
      setForm(emptyPassphraseForm);
      setPassphraseOpen(false);
      const message = "Encryption passphrase updated.";
      setNotice(message);
      onNotice?.(message);
    } catch (failure) {
      setError(
        failure?.status === 409
          ? "Encryption settings changed in another session. Reload the page and try again."
          : failure?.message || "Could not change the encryption passphrase.",
      );
    } finally {
      setBusy(false);
    }
  };

  const prepareRecoveryRotation = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!form.current)
      return setError("Enter your current encryption passphrase to create a new Recovery Key.");
    if (!metadata?.metadata || !getEncryptionKey(ownerId))
      return setError("Unlock your Chronicle before changing its encryption settings.");
    setBusy(true);
    try {
      const masterKey = await unlockWithPassphrase(
        form.current,
        ownerId,
        metadata.metadata.passphraseWrap,
        { extractable: true },
      );
      const recoveryKey = createRecoveryKey();
      const recoveryWrap = await createRecoveryWrap(masterKey, recoveryKey, ownerId);
      setRecoveryDraft({ recoveryKey, recoveryWrap });
      setSavedAcknowledged(false);
      setRotating(true);
    } catch (failure) {
      setError(failure?.message || "Could not create a new Recovery Key.");
    } finally {
      setBusy(false);
    }
  };

  const saveRecoveryRotation = async () => {
    if (!recoveryDraft || !savedAcknowledged || busy) return;
    setBusy(true);
    setError("");
    try {
      await saveMetadata({
        ...metadata.metadata,
        revision: metadata.metadata.revision,
        recoveryWrap: recoveryDraft.recoveryWrap,
      });
      setRecoveryDraft(null);
      setRotating(false);
      setForm(emptyPassphraseForm);
      const message = "Recovery Key replaced. Keep the new key somewhere safe.";
      setNotice(message);
      onNotice?.(message);
    } catch (failure) {
      setError(
        failure?.status === 409
          ? "Encryption settings changed in another session. Reload the page and try again."
          : failure?.message || "Could not save the new Recovery Key.",
      );
    } finally {
      setBusy(false);
    }
  };

  const copyRecoveryKey = async () => {
    try {
      await navigator.clipboard.writeText(recoveryDraft.recoveryKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Clipboard access was unavailable. Select and copy the Recovery Key manually.");
    }
  };

  const cancelForms = () => {
    setPassphraseOpen(false);
    setRotating(false);
    setRecoveryDraft(null);
    setForm(emptyPassphraseForm);
    setError("");
  };

  const configured = metadata?.configured === true;
  const encryptionMetadata = metadata?.metadata;

  return (
    <section className="scroll-mt-24 space-y-8" id="encryption-settings">
      <div className="border-b border-hairline pb-6">
        <h3 className="font-serif text-2xl tracking-tight text-charcoal sm:text-[28px]">
          Encryption & recovery
        </h3>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-charcoal-muted">
          New entries are encrypted before they leave this device. Chronicle
          cannot read them or recover your keys.
        </p>
      </div>

      {loading ? (
        <p className="text-[13px] text-muted-gray" role="status">
          Loading encryption details…
        </p>
      ) : loadError ? (
        <p className="text-[13px] leading-relaxed text-danger" role="alert">
          {loadError}
        </p>
      ) : configured ? (
        <>
          <div className="divide-y divide-hairline border-y border-hairline">
            <SettingsRow
              label="End-to-end encryption"
              value="Active · AES-256-GCM"
            />
            <SettingsRow
              label="This device"
              value={getEncryptionKey(ownerId) ? "Unlocked" : "Locked"}
            />
            <SettingsRow
              label="Encryption passphrase"
              value="Configured · value hidden"
              action={
                !passphraseOpen && !rotating ? (
                  <TextAction
                    onClick={() => {
                      setPassphraseOpen(true);
                      setRotating(false);
                      setRecoveryDraft(null);
                      setError("");
                    }}
                  >
                    Change passphrase
                  </TextAction>
                ) : null
              }
            />
            <SettingsRow
              label="Recovery key"
              value={
                encryptionMetadata?.recoveryWrap
                  ? "Configured · value hidden"
                  : "Not available"
              }
              action={
                !passphraseOpen && !rotating ? (
                  <TextAction
                    onClick={() => {
                      setRotating(true);
                      setPassphraseOpen(false);
                      setRecoveryDraft(null);
                      setError("");
                    }}
                  >
                    Replace Recovery Key
                  </TextAction>
                ) : null
              }
            />
          </div>

          <p className="rounded-lg border-l border-sage/50 pl-5 text-[13px] leading-relaxed text-charcoal-muted">
            Keep your Recovery Key offline. Chronicle cannot recover it for you.
          </p>

          <AnimatePresence initial={false}>
            {recoveryDraft ? (
              <motion.div
                key="recovery-draft"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="border-y border-hairline py-6">
                  <h4 className="font-serif text-xl tracking-tight text-charcoal">
                    Save your new Recovery Key
                  </h4>
                  <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-charcoal-muted">
                    This will not be shown again.
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <input
                      aria-label="New Recovery Key"
                      readOnly
                      value={recoveryDraft.recoveryKey}
                      onFocus={(event) => event.target.select()}
                      className="field-input !rounded-lg min-w-0 flex-1 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={copyRecoveryKey}
                      className="shrink-0 border border-hairline px-5 py-3 text-[13px] font-medium text-charcoal transition-colors hover:border-sage/60 hover:text-sage-dark"
                    >
                      {copied ? "Copied" : "Copy key"}
                    </button>
                  </div>
                  <label className="mt-4 flex items-start gap-3 text-[13px] leading-relaxed text-charcoal-muted">
                    <input
                      type="checkbox"
                      checked={savedAcknowledged}
                      onChange={(event) => setSavedAcknowledged(event.target.checked)}
                      className="mt-0.5 accent-sage-deep"
                    />
                    I saved the new Recovery Key somewhere safe.
                  </label>
                  <div className="mt-5 flex flex-wrap justify-end gap-5">
                    <button
                      type="button"
                      onClick={cancelForms}
                      className="text-[13px] text-muted-gray transition-colors hover:text-charcoal"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!savedAcknowledged || busy}
                      onClick={saveRecoveryRotation}
                      className="border-b border-sage/60 pb-0.5 text-[13px] font-medium text-sage-dark transition-colors hover:border-sage hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busy ? "Saving key…" : "Save new key"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {(passphraseOpen || rotating) && !recoveryDraft ? (
              <motion.form
                key="encryption-form"
                onSubmit={rotating ? prepareRecoveryRotation : changePassphrase}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-5 border-y border-hairline py-6">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h4 className="font-serif text-xl tracking-tight text-charcoal">
                        {rotating ? "Create a replacement Recovery Key" : "Change encryption passphrase"}
                      </h4>
                      <p className="mt-2 text-[13px] leading-relaxed text-charcoal-muted">
                        {rotating
                          ? "Confirm your passphrase to create a new key."
                          : "Choose a new passphrase with at least 12 characters."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={cancelForms}
                      className="shrink-0 text-[13px] text-muted-gray transition-colors hover:text-charcoal"
                    >
                      Cancel
                    </button>
                  </div>

                  <label className="block">
                    <span className="field-label">Current encryption passphrase</span>
                    <input
                      required
                      type="password"
                      autoComplete="current-password"
                      name="current"
                      value={form.current}
                      onChange={updateForm}
                      className="field-input !rounded-lg"
                    />
                  </label>

                  {!rotating ? (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block">
                        <span className="field-label">New passphrase</span>
                        <input
                          required
                          minLength={12}
                          type="password"
                          autoComplete="new-password"
                          name="next"
                          value={form.next}
                          onChange={updateForm}
                          className="field-input !rounded-lg"
                        />
                      </label>
                      <label className="block">
                        <span className="field-label">Confirm new passphrase</span>
                        <input
                          required
                          minLength={12}
                          type="password"
                          autoComplete="new-password"
                          name="confirm"
                          value={form.confirm}
                          onChange={updateForm}
                          className="field-input !rounded-lg"
                        />
                      </label>
                    </div>
                  ) : null}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={busy}
                      className="border-b border-sage/60 pb-0.5 text-[13px] font-medium text-sage-dark transition-colors hover:border-sage hover:text-charcoal disabled:cursor-wait disabled:opacity-50"
                    >
                      {busy
                        ? "Working…"
                        : rotating
                          ? "Create new Recovery Key"
                          : "Update passphrase"}
                    </button>
                  </div>
                </div>
              </motion.form>
            ) : null}
          </AnimatePresence>

          {error ? (
            <p className="text-[13px] leading-relaxed text-danger" role="alert">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="text-[13px] leading-relaxed text-sage-dark" role="status">
              {notice}
            </p>
          ) : null}
        </>
      ) : (
        <div className="border-y border-hairline py-6">
          <p className="text-[14px] text-charcoal">Encryption is not configured.</p>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-charcoal-muted">
            Complete setup when you unlock Chronicle.
          </p>
        </div>
      )}
    </section>
  );
}
