"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result =
        mode === "sign-up"
          ? await authClient.signUp.email({ name, email, password })
          : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError("We couldn’t sign you in with those details. Check them and try again.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("We couldn’t sign you in right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {mode === "sign-up" && (
        <label>
          Field name
          <input
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
      )}
      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="auth-submit" type="submit" disabled={pending}>
        {pending ? "One moment…" : mode === "sign-up" ? "Create account" : "Sign in"}
      </button>
      <p className="auth-switch">
        {mode === "sign-up" ? "Already have an account?" : "New to the field?"}{" "}
        <button
          type="button"
          onClick={() => {
            setError("");
            setMode(mode === "sign-up" ? "sign-in" : "sign-up");
          }}
        >
          {mode === "sign-up" ? "Sign in" : "Create an account"}
        </button>
      </p>
    </form>
  );
}
