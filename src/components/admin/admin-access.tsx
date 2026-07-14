"use client";

import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  clearFailedLogins,
  loginLockMessage,
  registerFailedLogin,
} from "@/lib/login-security";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

const adminSessionKey = "alisveris-admin-session-v1";

export function AdminAccess() {
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setAuthorized(window.localStorage.getItem(adminSessionKey) === "active");
    setReady(true);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes("@") || password.length < 8) {
      setError("Düzgün e-poçt və ən azı 8 simvolluq şifrə daxil edin.");
      return;
    }

    const lockedMessage = loginLockMessage("admin", normalizedEmail);
    if (lockedMessage) {
      setError(lockedMessage);
      return;
    }

    if (!isSupabaseConfigured) {
      setError("Admin girişi üçün Supabase dəyişənlərini qoşun.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (signInError) {
      setError(registerFailedLogin("admin", normalizedEmail));
      return;
    }

    const [{ data: isAdmin }, { data: isSuperAdmin }] = await Promise.all([
      supabase.rpc("has_role", { required_role: "admin" }),
      supabase.rpc("has_role", { required_role: "super_admin" }),
    ]);
    if (!isAdmin && !isSuperAdmin) {
      await supabase.auth.signOut();
      setError(registerFailedLogin("admin", normalizedEmail));
      return;
    }

    clearFailedLogins("admin", normalizedEmail);
    window.localStorage.setItem(adminSessionKey, "active");
    setAuthorized(true);
  }

  function logout() {
    if (isSupabaseConfigured) void createSupabaseBrowserClient().auth.signOut();
    window.localStorage.removeItem(adminSessionKey);
    setAuthorized(false);
    setPassword("");
  }

  if (!ready) return <div className="min-h-screen bg-slate-950" />;

  if (authorized) {
    return (
      <div className="relative">
        <Button className="fixed right-4 top-4 z-[60]" size="sm" type="button" variant="secondary" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Admin çıxış
        </Button>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-5 text-white">
      <Card className="w-full max-w-md border-white/10 bg-slate-900 p-6 text-white animate-scale-in">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-white">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-black">
          Admin girişi
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          5 səhv giriş cəhdindən sonra giriş 15 dəqiqə bloklanır.
        </p>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label>
            <span className="text-sm font-bold">Admin e-poçtu</span>
            <Input className="mt-2 border-white/10 bg-slate-950 text-white" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span className="text-sm font-bold">Şifrə</span>
            <Input className="mt-2 border-white/10 bg-slate-950 text-white" minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <p className="text-sm font-semibold text-red-300" role="alert">{error}</p> : null}
          <Button type="submit">
            <KeyRound className="h-4 w-4" />
            Daxil ol
          </Button>
        </form>
      </Card>
    </main>
  );
}
