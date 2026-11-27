import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Copy, KeyRound, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { e2eeApi } from "../../lib/api";
import { getEncryptionKey } from "../../lib/cryptoSession.js";
import {
  changePassphrase as rewrapPassphrase,
  createRecoveryKey,
  createRecoveryWrap,
  unlockWithPassphrase,
} from "../../lib/keyManager.js";

const emptyPassphraseForm = { current: "", next: "", confirm: "" };

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
    setLoading(true);
    e2eeApi.getMetadata(token)
      .then((result) => { if (active) setMetadata(result); })
      .catch((failure) => { if (active) setLoadError(failure?.message || "Could not load encryption settings."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const updateForm = (event) => setForm((value) => ({ ...value, [event.target.name]: event.target.value }));

  const saveMetadata = async (nextMetadata) => {
    const result = await e2eeApi.updateMetadata({
      passphraseWrap: nextMetadata.passphraseWrap,
      recoveryWrap: nextMetadata.recoveryWrap,
    }, nextMetadata.revision, token);
    setMetadata(result);
    return result;
  };

  const changePassphrase = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (form.next.length < 12) return setError("Choose an encryption passphrase with at least 12 characters.");
    if (form.next !== form.confirm) return setError("The new passphrases do not match.");
    if (form.current === form.next) return setError("Choose a different passphrase.");
    if (!metadata?.metadata || !getEncryptionKey(ownerId)) return setError("Unlock your Chronicle before changing its encryption settings.");
    setBusy(true);
    try {
      const updatedMetadata = await rewrapPassphrase(form.current, form.next, ownerId, metadata.metadata);
      await saveMetadata({ ...updatedMetadata, revision: metadata.metadata.revision });
      setForm(emptyPassphraseForm);
      setPassphraseOpen(false);
      const message = "Encryption passphrase updated.";
      setNotice(message);
      onNotice?.(message);
    } catch (failure) {
      setError(failure?.status === 409 ? "Encryption settings changed in another session. Reload the page and try again." : failure?.message || "Could not change the encryption passphrase.");
    } finally {
      setBusy(false);
    }
  };

  const prepareRecoveryRotation = async () => {
    setError("");
    setNotice("");
    if (!form.current) return setError("Enter your current encryption passphrase to create a new Recovery Key.");
    if (!metadata?.metadata || !getEncryptionKey(ownerId)) return setError("Unlock your Chronicle before changing its encryption settings.");
    setBusy(true);
    try {
      const masterKey = await unlockWithPassphrase(form.current, ownerId, metadata.metadata.passphraseWrap, { extractable: true });
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
      await saveMetadata({ ...metadata.metadata, revision: metadata.metadata.revision, recoveryWrap: recoveryDraft.recoveryWrap });
      setRecoveryDraft(null);
      setRotating(false);
      setForm(emptyPassphraseForm);
      const message = "Recovery Key replaced. Keep the new key somewhere safe.";
      setNotice(message);
      onNotice?.(message);
    } catch (failure) {
      setError(failure?.status === 409 ? "Encryption settings changed in another session. Reload the page and try again." : failure?.message || "Could not save the new Recovery Key.");
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

  const cancelRecoveryRotation = () => {
    setRecoveryDraft(null);
    setRotating(false);
    setForm(emptyPassphraseForm);
    setError("");
  };

  const configured = metadata?.configured === true;
  const encryptionMetadata = metadata?.metadata;

  return (
    <section className="rounded-3xl border border-hairline bg-paper p-6 shadow-paper sm:p-7">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage-subtle text-sage-deep"><LockKeyhole className="h-4 w-4" /></span>
        <div>
          <h2 className="font-serif text-xl tracking-tight text-charcoal">Encryption & recovery</h2>
          <p className="mt-1 text-[12px] leading-relaxed text-charcoal-muted">Manage the keys that protect your journal on this account.</p>
        </div>
      </div>

      {loading ? (
        <p className="mt-5 flex items-center gap-2 text-xs text-muted-gray"><Loader2 className="h-4 w-4 animate-spin" />Loading encryption details…</p>
      ) : loadError ? (
        <p role="alert" className="mt-5 text-xs text-danger">{loadError}</p>
      ) : configured ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-hairline bg-warm-beige/40 p-4">
              <p className="flex items-center gap-2 text-[12px] font-medium text-charcoal"><ShieldCheck className="h-4 w-4 text-sage-deep" />End-to-end encryption</p>
              <p className="mt-2 text-[11px] leading-relaxed text-charcoal-muted">New entry content is encrypted in your browser with AES-256-GCM before storage. Dates remain visible, existing entries are not migrated, and Chronicle does not store your passphrase.</p>
              <span className="mt-3 inline-flex rounded-full bg-sage-subtle px-2.5 py-1 text-[9px] font-medium uppercase tracking-wide2 text-sage-deep">{getEncryptionKey(ownerId) ? "Unlocked on this device" : "Set up"}</span>
            </div>
            <div className="rounded-2xl border border-hairline bg-warm-beige/40 p-4">
              <p className="flex items-center gap-2 text-[12px] font-medium text-charcoal"><KeyRound className="h-4 w-4 text-sage-deep" />Recovery Key</p>
              <p className="mt-2 text-[11px] leading-relaxed text-charcoal-muted">A separate key can unlock your journal if you forget the passphrase. It is only shown when first created or rotated, and cannot be recovered by Chronicle.</p>
              <span className="mt-3 inline-flex rounded-full bg-sage-subtle px-2.5 py-1 text-[9px] font-medium uppercase tracking-wide2 text-sage-deep">{encryptionMetadata?.recoveryWrap ? "Configured · value hidden" : "Not available"}</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-hairline px-4 py-3 text-[10px] leading-relaxed text-muted-gray">
            Encryption uses AES-256-GCM with a 256-bit master key. Your passphrase is processed with Argon2id (64 MiB, 3 passes). Changing the passphrase rewraps the same master key, so encrypted entries remain readable. Encrypted entries are not yet included in server search, insights, or exports.
          </div>

          {recoveryDraft ? (
            <div className="mt-5 rounded-2xl border border-sage/30 bg-sage-subtle/40 p-4">
              <p className="text-[12px] font-medium text-charcoal">Save your new Recovery Key</p>
              <p className="mt-1 text-[11px] leading-relaxed text-charcoal-muted">The old Recovery Key will stop working after you save this one. This value will not be shown again.</p>
              <div className="mt-3 flex gap-2">
                <input aria-label="New Recovery Key" readOnly value={recoveryDraft.recoveryKey} onFocus={(event) => event.target.select()} className="field-input min-w-0 flex-1 font-mono text-[10px]" />
                <button type="button" onClick={copyRecoveryKey} aria-label="Copy new Recovery Key" className="rounded-xl border border-hairline px-3 text-charcoal">{copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
              </div>
              <label className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-charcoal-muted"><input type="checkbox" checked={savedAcknowledged} onChange={(event) => setSavedAcknowledged(event.target.checked)} className="mt-0.5 accent-sage-deep" />I saved the new Recovery Key somewhere safe.</label>
              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={cancelRecoveryRotation} className="btn-ghost border border-hairline !px-4 !py-2 text-[10px]">Cancel</button>
                <button type="button" disabled={!savedAcknowledged || busy} onClick={saveRecoveryRotation} className="btn-sage !px-4 !py-2 text-[10px] disabled:opacity-50">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}Save new key</button>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => { setPassphraseOpen((value) => !value); setRotating(false); setRecoveryDraft(null); setError(""); }} className="btn-ghost justify-center border border-hairline !px-4 !py-2.5 text-[10px]">Change encryption passphrase</button>
              <button type="button" onClick={() => { setRotating((value) => !value); setPassphraseOpen(false); setError(""); }} className="btn-ghost justify-center border border-hairline !px-4 !py-2.5 text-[10px]">Replace Recovery Key</button>
            </div>
          )}

          {(passphraseOpen || rotating) && !recoveryDraft && (
            <form onSubmit={rotating ? (event) => { event.preventDefault(); prepareRecoveryRotation(); } : changePassphrase} className="mt-4 space-y-3 rounded-2xl border border-hairline bg-ivory/60 p-4">
              <p className="text-[11px] leading-relaxed text-charcoal-muted">{rotating ? "Confirm your encryption passphrase to create a replacement Recovery Key." : "Confirm your current passphrase, then choose a new one (at least 12 characters)."}</p>
              <label className="block"><span className="field-label">Current encryption passphrase</span><input required type="password" autoComplete="current-password" name="current" value={form.current} onChange={updateForm} className="field-input" /></label>
              {!rotating && <div className="grid gap-3 sm:grid-cols-2"><label className="block"><span className="field-label">New passphrase (12+ characters)</span><input required minLength={12} type="password" autoComplete="new-password" name="next" value={form.next} onChange={updateForm} className="field-input" /></label><label className="block"><span className="field-label">Confirm new passphrase</span><input required minLength={12} type="password" autoComplete="new-password" name="confirm" value={form.confirm} onChange={updateForm} className="field-input" /></label></div>}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => { setPassphraseOpen(false); setRotating(false); setForm(emptyPassphraseForm); setError(""); }} className="btn-ghost border border-hairline !px-4 !py-2 text-[10px]">Cancel</button><button type="submit" disabled={busy} className="btn-sage !px-4 !py-2 text-[10px]">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}{rotating ? "Create new Recovery Key" : "Update passphrase"}</button></div>
            </form>
          )}
          {error && <p role="alert" className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-danger"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}</p>}
          {notice && <p role="status" className="mt-4 flex items-start gap-2 text-[11px] text-sage-deep"><CheckCircle2 className="h-3.5 w-3.5 shrink-0" />{notice}</p>}
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-hairline bg-warm-beige/40 p-4">
          <p className="text-[12px] font-medium text-charcoal">Encryption is not configured</p>
          <p className="mt-1 text-[11px] leading-relaxed text-charcoal-muted">Your account does not currently have a passphrase or Recovery Key set up.</p>
        </div>
      )}
    </section>
  );
}
