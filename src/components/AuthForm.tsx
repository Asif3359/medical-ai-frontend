"use client";

import { useState } from "react";
import { loginUser, registerUser } from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/config";
import { IconLock, IconLogin, IconMail, IconUser, IconUserPlus } from "./Icons";

type Mode = "login" | "register";

export default function AuthForm({ onSuccess }: { onSuccess?: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        await registerUser({ name, email, password });
        localStorage.setItem(STORAGE_KEYS.userEmail, email);
        localStorage.setItem(STORAGE_KEYS.userName, name);
      } else {
        await loginUser({ email, password });
        localStorage.setItem(STORAGE_KEYS.userEmail, email);
      }
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white text-black rounded-xl border border-black">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-black/60 mt-2">
          {mode === "login" ? "Login to access your account" : "Get started with your account"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "register" && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-black">Name</label>
            <div className="flex items-center gap-2 border border-black rounded-lg px-3 py-2">
              <IconUser />
              <input
                className="w-full bg-transparent outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-black">Email</label>
          <div className="flex items-center gap-2 border border-black rounded-lg px-3 py-2">
            <IconMail />
            <input
              type="email"
              className="w-full bg-transparent outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-black">Password</label>
          <div className="flex items-center gap-2 border border-black rounded-lg px-3 py-2">
            <IconLock />
            <input
              type="password"
              className="w-full bg-transparent outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-black/10 text-black rounded-lg text-sm">{error}</div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium bg-black text-white hover:bg-black/80 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            "Please wait..."
          ) : mode === "login" ? (
            <>
              <IconLogin /> Login
            </>
          ) : (
            <>
              <IconUserPlus /> Register
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-black/80">
        {mode === "login" ? (
          <button onClick={() => setMode("register")} className="underline underline-offset-2 font-medium">
            Don&apos;t have an account? Sign up
          </button>
        ) : (
          <button onClick={() => setMode("login")} className="underline underline-offset-2 font-medium">
            Already have an account? Sign in
          </button>
        )}
      </div>
    </div>
  );
}