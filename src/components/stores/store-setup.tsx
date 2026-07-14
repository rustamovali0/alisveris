"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImagePlus, Store, UploadCloud } from "lucide-react";
import { useAccount } from "@/components/providers/account-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function StoreSetup() {
  const router = useRouter();
  const { account, ready, saveStore } = useAccount();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!account) router.replace("/giris");
    else if (account.accountType !== "store") router.replace("/profil");
    else if (account.store) router.replace("/elan-yerlesdir");
  }, [account, ready, router]);

  function selectLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Mağaza loqosu şəkil formatında olmalıdır.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Mağaza loqosu maksimum 2 MB ola bilər.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(String(reader.result));
      setError("");
    };
    reader.readAsDataURL(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Mağaza adını daxil edin.");
      return;
    }
    if (!logoUrl) {
      setError("Mağaza loqosunu əlavə edin.");
      return;
    }
    setSaving(true);
    try {
      await saveStore({ name: name.trim(), logoUrl });
      router.push("/elan-yerlesdir");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Mağaza yaradılmadı.");
    } finally {
      setSaving(false);
    }
  }

  if (!ready || !account || account.accountType !== "store" || account.store) {
    return <div className="container-shell min-h-[60vh] py-10" />;
  }

  return (
    <div className="container-shell grid min-h-[70vh] place-items-center py-10">
      <Card className="w-full max-w-2xl p-6 animate-scale-in">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-black">Mağazanı yaradın</h1>
            <p className="mt-1 text-sm text-muted">
              Mağaza yalnız bir dəfə yaradılır. Sonra bütün məhsullar bu vitrinə əlavə edilir.
            </p>
          </div>
        </div>

        <form className="mt-6 grid gap-5" onSubmit={submit}>
          <label>
            <span className="text-sm font-bold">Mağaza adı</span>
            <Input
              className="mt-2"
              placeholder="Məsələn, Tech Plaza"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="grid min-h-52 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-border bg-background p-6 text-center hover:border-primary/50">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="Mağaza loqosu" className="h-28 w-28 rounded-lg object-cover" src={logoUrl} />
            ) : (
              <div>
                <UploadCloud className="mx-auto h-9 w-9 text-primary" />
                <p className="mt-3 font-bold">Mağaza loqosunu əlavə et</p>
                <p className="mt-1 text-xs text-muted">JPG, PNG və ya WebP, maksimum 2 MB</p>
              </div>
            )}
            <input accept="image/*" className="sr-only" type="file" onChange={selectLogo} />
          </label>
          {error ? <p className="text-sm font-semibold text-danger" role="alert">{error}</p> : null}
          <Button className="w-full" disabled={saving} type="submit">
            <ImagePlus className="h-4 w-4" />
            {saving ? "Mağaza yaradılır..." : "Mağazanı yarat və məhsul əlavə et"}
          </Button>
        </form>
        <Button asChild className="mt-3 w-full" variant="ghost">
          <Link href="/">Ləğv et</Link>
        </Button>
      </Card>
    </div>
  );
}
