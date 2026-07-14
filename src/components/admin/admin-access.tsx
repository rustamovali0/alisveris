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
      setError("Giriş xidməti hazırda əlçatan deyil. Sistem ayarlarını yoxlayın.");
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
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f3f4f6] p-4 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-2 bg-primary" />
      <Card className="w-full max-w-[460px] overflow-hidden border-slate-200 bg-white p-0 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.14)] animate-scale-in">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-base font-black text-white">
              a
            </span>
            <span className="font-black">alışveriş.az</span>
          </div>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
            Admin
          </span>
        </div>
        <div className="p-5 sm:p-7">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h1 className="mt-5 text-2xl font-black">İdarəetmə panelinə giriş</h1>
          <p className="mt-2 text-sm text-slate-500">
            Admin hesabınızla davam edin.
          </p>
          <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label>
            <span className="text-sm font-bold">E-poçt</span>
            <Input
              autoComplete="email"
              className="mt-2 h-12 border-slate-300 bg-white text-slate-950"
              placeholder="admin@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            <span className="text-sm font-bold">Şifrə</span>
            <Input
              autoComplete="current-password"
              className="mt-2 h-12 border-slate-300 bg-white text-slate-950"
              minLength={8}
              placeholder="Şifrənizi daxil edin"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <Button className="mt-1 h-12 w-full" type="submit">
            <KeyRound className="h-4 w-4" />
            Daxil ol
          </Button>
          </form>
        </div>
      </Card>
    </main>
  );
}
