import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, Copy, KeyRound, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { e2eeApi } from "../../lib/api";
import {
  createMasterKey,
  createPassphraseWrap,
  createRecoveryKey,
  createRecoveryWrap,
  createWorkingMasterKey,
  unlockWithPassphrase,
  unlockWithRecoveryKey,
} from "../../lib/keyManager.js";
import { getEncryptionKey, setEncryptionSession } from "../../lib/cryptoSession.js";

const fieldClass = "w-full rounded-xl border border-hairline bg-paper px-4 py-3 text-sm text-charcoal outline-none transition focus:border-sage";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-sage-deep px-5 py-3 text-sm font-medium text-white transition hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-50";

export default function EncryptionGate({ children }) {
  const { user, token, logout } = useAuth();
  const ownerId = useMemo(() => String(user?._id || user?.id || ""), [user]);
  const [metadata, setMetadata] = useState(undefined);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [mode, setMode] = useState("passphrase");
  const [passphrase, setPassphrase] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [recoveryInput, setRecoveryInput] = useState("");
  const [draft, setDraft] = useState(null);
  const [savedAcknowledged, setSavedAcknowledged] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(() => Boolean(ownerId && getEncryptionKey(ownerId)));
  const [copied, setCopied] = useState(false);
  const [skippedOwnerId, setSkippedOwnerId] = useState(() => {
    try { return window.sessionStorage.getItem("chronicle.e2ee.skipOwnerId") || ""; } catch { return ""; }
  });

  useEffect(() => {
    if (!token || !ownerId || getEncryptionKey(ownerId)) {
      setUnlocked(Boolean(ownerId && getEncryptionKey(ownerId)));
      return undefined;
    }
    let active = true;
    setMetadata(undefined);
    setLoadError("");
    e2eeApi.getMetadata(token)
      .then((data) => {
        if (active) setMetadata(data);
      })
      .catch((failure) => {
        if (active) setLoadError(failure?.message || "Could not load encryption settings.");
      });
    return () => { active = false; };
  }, [token, ownerId, unlocked, reloadKey]);

  if (unlocked && ownerId && getEncryptionKey(ownerId)) return children;
  if (skippedOwnerId === ownerId && metadata !== undefined && metadata?.configured !== true) return children;

  if (!ownerId) {
    return (
      <div className="grid min-h-screen place-items-center bg-ivory px-4">
        <section className="w-full max-w-md rounded-2xl border border-hairline bg-paper p-7 text-center shadow-paper-lg">
          <h1 className="font-serif text-xl text-charcoal">Account details unavailable</h1>
          <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">Chronicle needs your account ID to unlock encryption. Sign in again to reload your profile.</p>
          <button type="button" className={`${buttonClass} mt-5`} onClick={logout}>Sign out</button>
        </section>
      </div>
    );
  }

  const configured = Boolean(metadata?.configured && metadata?.metadata);
  const working = busy;

  const beginSetup = async (event) => {
    event.preventDefault();
    setError("");
    if (passphrase.length < 12) {
      setError("Choose an encryption passphrase with at least 12 characters.");
      return;
    }
    if (passphrase !== confirmation) {
      setError("The passphrases do not match.");
      return;
    }
    setBusy(true);
    try {
      const masterKey = await createMasterKey();
      const recoveryKey = createRecoveryKey();
      const passphraseWrap = await createPassphraseWrap(masterKey, passphrase, ownerId);
      const recoveryWrap = await createRecoveryWrap(masterKey, recoveryKey, ownerId);
      setDraft({ masterKey, recoveryKey, passphraseWrap, recoveryWrap });
      setPassphrase("");
      setConfirmation("");
    } catch (failure) {
      setError(failure?.message || "Could not prepare encryption on this device.");
    } finally {
      setBusy(false);
    }
  };

  const finishSetup = async () => {
    if (!draft || !savedAcknowledged) return;
    setBusy(true);
    setError("");
    try {
      const result = await e2eeApi.setInitialMetadata({
        passphraseWrap: draft.passphraseWrap,
        recoveryWrap: draft.recoveryWrap,
      }, token);
      if (!result?.configured) throw new Error("Encryption setup was not saved.");
      const workingKey = await createWorkingMasterKey(draft.masterKey);
      setEncryptionSession(ownerId, workingKey);
      setDraft(null);
      setUnlocked(true);
    } catch (failure) {
      setError(failure?.message || "Could not save encryption settings.");
    } finally {
      setBusy(false);
    }
  };

  const unlock = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const key = mode === "passphrase"
        ? await unlockWithPassphrase(passphrase, ownerId, metadata.metadata.passphraseWrap)
        : await unlockWithRecoveryKey(recoveryInput.trim(), ownerId, metadata.metadata.recoveryWrap);
      setEncryptionSession(ownerId, key);
      setPassphrase("");
      setRecoveryInput("");
      setUnlocked(true);
    } catch {
      setError(mode === "passphrase" ? "That passphrase could not unlock this Chronicle." : "That Recovery Key could not unlock this Chronicle.");
    } finally {
      setBusy(false);
    }
  };

  const copyRecoveryKey = async () => {
    try {
      await navigator.clipboard.writeText(draft.recoveryKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access was unavailable. Select and copy the Recovery Key manually.");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-ivory px-4 py-10">
      <section className="w-full max-w-xl rounded-2xl border border-hairline bg-paper p-6 shadow-paper-lg sm:p-9">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-subtle text-sage-deep">
            {configured ? <LockKeyhole className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-wide2 text-muted-gray">Chronicle encryption</p>
            <h1 className="mt-1 font-serif text-2xl tracking-tight text-charcoal">
              {draft ? "Save your Recovery Key" : configured ? "Unlock your journal" : "Set up private encryption"}
            </h1>
          </div>
        </div>

        {loadError ? (
          <div role="alert" className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            {loadError}
            <button className="ml-2 underline" onClick={() => setReloadKey((value) => value + 1)}>Try again</button>
          </div>
        ) : metadata === undefined ? (
          <div className="flex items-center gap-3 py-8 text-sm text-charcoal-muted"><Loader2 className="h-4 w-4 animate-spin" />Loading encryption settings…</div>
        ) : draft ? (
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-charcoal-muted">This Recovery Key is shown only once. Store it somewhere safe and separate from your Chronicle passphrase. Anyone with this key can unlock your encrypted entries.</p>
            <div className="flex gap-2">
              <input aria-label="Recovery Key" readOnly value={draft.recoveryKey} className={`${fieldClass} font-mono text-xs`} onFocus={(event) => event.target.select()} />
              <button type="button" onClick={copyRecoveryKey} className="rounded-xl border border-hairline px-4 text-charcoal" aria-label="Copy Recovery Key">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
            </div>
            <label className="flex items-start gap-3 text-sm leading-relaxed text-charcoal-muted">
              <input type="checkbox" checked={savedAcknowledged} onChange={(event) => setSavedAcknowledged(event.target.checked)} className="mt-1 accent-sage-deep" />
              I saved this Recovery Key somewhere safe. Chronicle cannot restore it if I lose it.
            </label>
            <button type="button" className={`${buttonClass} w-full`} disabled={!savedAcknowledged || working} onClick={finishSetup}>
              {working ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Save key and continue
            </button>
          </div>
        ) : configured ? (
          <form onSubmit={unlock} className="space-y-4">
            <div className="flex gap-2 rounded-xl bg-warm-beige/60 p-1">
              <button type="button" onClick={() => setMode("passphrase")} className={`flex-1 rounded-lg px-3 py-2 text-xs ${mode === "passphrase" ? "bg-paper text-charcoal shadow-sm" : "text-muted-gray"}`}>Passphrase</button>
              <button type="button" onClick={() => setMode("recovery")} className={`flex-1 rounded-lg px-3 py-2 text-xs ${mode === "recovery" ? "bg-paper text-charcoal shadow-sm" : "text-muted-gray"}`}>Recovery Key</button>
            </div>
            {mode === "passphrase" ? (
              <input autoComplete="current-password" autoFocus type="password" required value={passphrase} onChange={(event) => setPassphrase(event.target.value)} placeholder="Encryption passphrase" className={fieldClass} />
            ) : (
              <input autoComplete="off" autoFocus value={recoveryInput} onChange={(event) => setRecoveryInput(event.target.value)} placeholder="43-character Recovery Key" className={`${fieldClass} font-mono text-xs`} />
            )}
            <button className={`${buttonClass} w-full`} disabled={working || (mode === "passphrase" ? !passphrase : !recoveryInput.trim())}>
              {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}Unlock Chronicle
            </button>
          </form>
        ) : (
          <>
            <div className="mb-5 rounded-xl border border-sage/20 bg-sage-subtle/50 p-4 text-xs leading-relaxed text-charcoal-muted">
              <p className="mb-2 flex items-center gap-2 font-medium text-charcoal"><AlertCircle className="h-4 w-4 text-sage-deep" />Before you enable encryption</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Entry title, text, mood, tags, and word count will be encrypted in your browser. Entry dates remain visible.</li>
                <li>Existing entries are not migrated. Uploaded images are not encrypted.</li>
                <li>Server search, insights, and exports do not yet process encrypted entries.</li>
                <li>If you lose both your passphrase and Recovery Key, encrypted entries cannot be recovered.</li>
              </ul>
            </div>
            <form onSubmit={beginSetup} className="space-y-4">
              <input autoComplete="new-password" type="password" required minLength={12} value={passphrase} onChange={(event) => setPassphrase(event.target.value)} placeholder="Create encryption passphrase (12+ characters)" className={fieldClass} />
              <input autoComplete="new-password" type="password" required minLength={12} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Confirm encryption passphrase" className={fieldClass} />
              <button className={`${buttonClass} w-full`} disabled={working}>
                {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}Create Recovery Key
              </button>
            </form>
            <button type="button" onClick={() => {
              try { window.sessionStorage.setItem("chronicle.e2ee.skipOwnerId", ownerId); } catch { /* Optional convenience only. */ }
              setSkippedOwnerId(ownerId);
            }} className="mt-4 w-full py-2 text-xs text-muted-gray underline underline-offset-4">Continue without encryption for now</button>
          </>
        )}

        {error && <p role="alert" className="mt-4 rounded-xl bg-danger/5 px-4 py-3 text-xs leading-relaxed text-danger">{error}</p>}
      </section>
    </div>
  );
}
