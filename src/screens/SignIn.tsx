import { useState } from "react";
import { Module, ModuleHeader } from "../components/ui/Module";
import { useAuth } from "../lib/auth";

export function SignIn({ onSuccess, onGoRegister }: { onSuccess: () => void; onGoRegister: () => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const inputCls =
    "bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:outline-none px-2 h-9 text-[13px] rounded-sm w-full";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email.trim() || !password) {
      setErr("Email and password required");
      return;
    }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      onSuccess();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="p-2 flex justify-center">
      <div className="w-full max-w-sm">
        <Module>
          <ModuleHeader label="Sign in" />
          <form onSubmit={submit} className="p-4 space-y-3">
            <label className="block">
              <span className="label block mb-1">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="label block mb-1">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={inputCls}
              />
            </label>
            {err && <p className="text-[12px] text-[var(--loss)]">{err}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full h-9 text-[12px] uppercase tracking-wider border border-[var(--border-strong)] hover:border-[var(--fg-2)] disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <p className="text-[11px] text-[var(--fg-3)] text-center pt-1">
              New here?{" "}
              <button type="button" onClick={onGoRegister} className="text-[var(--accent)] hover:underline">
                Create an account
              </button>
            </p>
          </form>
        </Module>
        <p className="text-[10px] text-center mt-2 text-[var(--fg-3)] uppercase tracking-wider">
          Synced with stocks-services.com
        </p>
      </div>
    </main>
  );
}
