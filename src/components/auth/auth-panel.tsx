"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Store, UserRound } from "lucide-react";
import {
  useAccount,
  type AccountType,
} from "@/components/providers/account-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AuthPanel({ initialMode }: { initialMode: "login" | "register" }) {
  const router = useRouter();
  const { login, register } = useAccount();
  const [mode, setMode] = useState(initialMode);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!accountType) {
      setError("Fərdi və ya Mağaza hesabını seçin.");
      return;
    }
    if (mode === "register" && name.trim().length < 2) {
      setError("Ad və soyad daxil edin.");
      return;
    }
    if (!email.includes("@") || password.length < 6) {
      setError("Düzgün e-poçt və ən azı 6 simvolluq şifrə daxil edin.");
      return;
    }

    setLoading(true);
    try {
      const profile =
        mode === "register"
          ? await register({ name, email, password, accountType })
          : await login({ email, password, accountType });
      router.push(profile.accountType === "store" && !profile.store ? "/magaza-yarat" : "/profil");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Əməliyyat tamamlanmadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-shell grid min-h-[calc(100vh-64px)] place-items-center py-10">
      <Card className="w-full max-w-xl p-5 sm:p-7 animate-scale-in">
        <div className="mb-6 flex rounded-lg bg-background p-1">
          {(["login", "register"] as const).map((item) => (
            <button
              className={cn(
                "h-10 flex-1 rounded-md text-sm font-bold transition",
                mode === item ? "bg-card text-primary shadow-sm" : "text-muted",
              )}
              key={item}
              type="button"
              onClick={() => {
                setMode(item);
                setError("");
              }}
            >
              {item === "login" ? "Giriş" : "Qeydiyyat"}
            </button>
          ))}
        </div>

        <div className="mb-5">
          <h1 className="text-2xl font-black">
            {mode === "login" ? "Hesabınıza daxil olun" : "Yeni hesab yaradın"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Hesab tipi yalnız bir dəfə seçilir. Sonradan yalnız admin dəyişə bilər.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3" role="group" aria-label="Hesab tipi">
          {([
            ["individual", "Fərdi", UserRound, "Şəxsi elanlar üçün"],
            ["store", "Mağaza", Store, "Vitrin və məhsullar üçün"],
          ] as const).map(([type, label, Icon, description]) => (
            <button
              aria-pressed={accountType === type}
              className={cn(
                "min-h-28 rounded-lg border p-4 text-left transition hover:border-primary/50",
                accountType === type
                  ? "border-primary bg-primary-soft text-primary-dark"
                  : "border-border bg-card",
              )}
              key={type}
              type="button"
              onClick={() => setAccountType(type)}
            >
              <Icon className="h-5 w-5" />
              <span className="mt-3 block font-black">{label}</span>
              <span className="mt-1 block text-xs text-muted">{description}</span>
            </button>
          ))}
        </div>

        <form className="grid gap-4" onSubmit={submit}>
          {mode === "register" ? (
            <label>
              <span className="text-sm font-bold">Ad və soyad</span>
              <Input
                autoComplete="name"
                className="mt-2"
                placeholder="Məsələn, Rauf Məmmədov"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          ) : null}
          <label>
            <span className="text-sm font-bold">E-poçt</span>
            <Input
              autoComplete="email"
              className="mt-2"
              placeholder="email@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            <span className="text-sm font-bold">Şifrə</span>
            <Input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="mt-2"
              minLength={6}
              placeholder="Ən azı 6 simvol"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? (
            <p className="rounded-lg border border-danger/20 bg-red-50 p-3 text-sm font-semibold text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <Button className="w-full" disabled={loading} type="submit">
            <LockKeyhole className="h-4 w-4" />
            {loading ? "Gözləyin..." : mode === "login" ? "Daxil ol" : "Hesab yarat"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          <Link className="font-bold text-primary" href="/">
            Ana səhifəyə qayıt
          </Link>
        </p>
      </Card>
    </div>
  );
}
