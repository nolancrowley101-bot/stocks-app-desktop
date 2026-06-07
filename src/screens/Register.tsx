import { useState } from "react";
import { Module, ModuleHeader } from "../components/ui/Module";
import { useAuth } from "../lib/auth";

export function Register({ onSuccess, onGoSignIn }: { onSuccess: () => void; onGoSignIn: () => void }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const inputCls =
    "bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:outline-none px-2 h-9 text-[13px] rounded-sm w-full";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email.trim()) return setErr("Email required");
    if (password.length < 8) return setErr("Password must be at least 8 characters");
    setBusy(true);
    try {
      await register(email.trim(), password, name.trim() || undefined);
      onSuccess();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="p-2 flex justify-center">
      <div className="w-full max-w-sm">
        <Module>
          <ModuleHeader label="Create account" />
          <form onSubmit={submit} className="p-4 space-y-3">
            <label className="block">
              <span className="label block mb-1">Name (optional)</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={inputCls}
              />
            </label>
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
                autoComplete="new-password"
                className={inputCls}
              />
            </label>
            {err && <p className="text-[12px] text-[var(--loss)]">{err}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full h-9 text-[12px] uppercase tracking-wider border border-[var(--border-strong)] hover:border-[var(--fg-2)] disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create account"}
            </button>
            <p className="text-[11px] text-[var(--fg-3)] text-center pt-1">
              Already have one?{" "}
              <button type="button" onClick={onGoSignIn} className="text-[var(--accent)] hover:underline">
                Sign in
              </button>
            </p>
          </form>
        </Module>
      </div>
    </main>
  );
}
