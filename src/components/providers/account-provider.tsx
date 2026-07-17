"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  clearFailedLogins,
  loginLockMessage,
  registerFailedLogin,
} from "@/lib/login-security";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

export type AccountType = "individual" | "store";

export type StoreProfile = {
  name: string;
  logoUrl: string;
};

export type AccountProfile = {
  id: string;
  name: string;
  accountType: AccountType;
  store?: StoreProfile;
};

type AccountContextValue = {
  account: AccountProfile | null;
  ready: boolean;
  register: (input: {
    name: string;
    email: string;
    password: string;
    accountType: AccountType;
  }) => Promise<AccountProfile>;
  login: (input: {
    email: string;
    password: string;
  }) => Promise<AccountProfile>;
  saveStore: (store: StoreProfile) => Promise<void>;
  logout: () => void;
};

const profilesKey = "alisveris-safe-profiles-v1";
export const accountSessionKey = "alisveris-account-session-v1";
const accountChangedEvent = "alisveris-account-changed";

const AccountContext = createContext<AccountContextValue | null>(null);

function translateAuthError(error: unknown, fallback: string) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const normalized = message.toLowerCase();

  if (error instanceof TypeError || normalized.includes("failed to fetch") || normalized.includes("network")) {
    return "Xidmətə qoşulmaq mümkün olmadı. İnternet və Supabase ayarlarını yoxlayın.";
  }
  if (
    normalized.includes("rate") ||
    normalized.includes("limit") ||
    normalized.includes("too many") ||
    normalized.includes("email rate")
  ) {
    return "E-poçt göndərmə limiti dolub. Bir neçə dəqiqə sonra yenidən cəhd edin.";
  }
  if (normalized.includes("already") || normalized.includes("registered")) {
    return "Bu e-poçtla hesab artıq mövcuddur.";
  }
  if (normalized.includes("invalid login") || normalized.includes("invalid credentials")) {
    return "E-poçt və ya şifrə düzgün deyil.";
  }
  if (normalized.includes("email not confirmed")) {
    return "E-poçt təsdiqlənməyib.";
  }
  if (normalized.includes("password") || normalized.includes("weak")) {
    return "Şifrə ən azı 6 simvol olmalıdır.";
  }
  if (normalized.includes("database") || normalized.includes("profile") || normalized.includes("foreign key")) {
    return "Hesab yaradıldı, profil məlumatları tamamlanmadı. Admin SQL qurulumunu yoxlayın.";
  }

  return fallback;
}

function readProfiles(): AccountProfile[] {
  try {
    return JSON.parse(window.localStorage.getItem(profilesKey) ?? "[]") as AccountProfile[];
  } catch {
    return [];
  }
}

function saveProfile(profile: AccountProfile) {
  const profiles = readProfiles();
  const next = profiles.some((item) => item.id === profile.id)
    ? profiles.map((item) => (item.id === profile.id ? profile : item))
    : [...profiles, profile];
  window.localStorage.setItem(profilesKey, JSON.stringify(next));
}

function readSession(): AccountProfile | null {
  try {
    const id = window.localStorage.getItem(accountSessionKey);
    if (!id) return null;
    return readProfiles().find((item) => item.id === id) ?? null;
  } catch {
    return null;
  }
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAccount(readSession());
    setReady(true);

    function syncAccount() {
      setAccount(readSession());
    }

    window.addEventListener(accountChangedEvent, syncAccount);
    window.addEventListener("storage", syncAccount);
    return () => {
      window.removeEventListener(accountChangedEvent, syncAccount);
      window.removeEventListener("storage", syncAccount);
    };
  }, []);

  function activate(profile: AccountProfile) {
    window.localStorage.setItem(accountSessionKey, profile.id);
    setAccount(profile);
    window.dispatchEvent(new Event(accountChangedEvent));
  }

  async function register(input: {
    name: string;
    email: string;
    password: string;
    accountType: AccountType;
  }) {
const userId = window.crypto.randomUUID();
    if (!isSupabaseConfigured && process.env.NODE_ENV === "production") {
      throw new Error(
        "Qeydiyyat xidməti düzgün qoşulmayıb. Supabase layihə ünvanını yoxlayın.",
      );
    }

    // Qeydiyyatda email göndərmə limiti istifadəçini bloklamasın deyə hesabı lokal sessiyada yaradırıq.
    // Real auth girişi login mərhələsində Supabase ilə işləyir.

    const profile: AccountProfile = {
      id: userId,
      name: input.name.trim(),
      accountType: input.accountType,
    };
    saveProfile(profile);
    activate(profile);
    return profile;
  }

  async function login(input: { email: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const lockedMessage = loginLockMessage("user", email);
    if (lockedMessage) throw new Error(lockedMessage);
    if (!isSupabaseConfigured) {
      throw new Error("Giriş üçün Supabase Auth dəyişənlərini qoşun. Lokal rejimdə yeni qeydiyyat işləyir.");
    }

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: input.password,
    });
    if (error || !data.user) {
      const failedMessage = registerFailedLogin("user", email);
      if (failedMessage.includes("bloklanıb")) throw new Error(failedMessage);
      throw new Error(error ? translateAuthError(error, "Məlumatlar düzgün deyil.") : "Məlumatlar düzgün deyil.");
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("full_name, account_type")
      .eq("id", data.user.id)
      .maybeSingle();
    const { data: storeRow } = await supabase
      .from("stores")
      .select("name, logo_url")
      .eq("owner_id", data.user.id)
      .maybeSingle();
    const storedType = (profileRow?.account_type ?? data.user.user_metadata.account_type) as
      | AccountType
      | undefined;
    clearFailedLogins("user", email);
    const profile: AccountProfile = {
      id: data.user.id,
      name: profileRow?.full_name ?? data.user.user_metadata.full_name ?? "İstifadəçi",
      accountType: storedType ?? "individual",
      store: storeRow
        ? { name: storeRow.name, logoUrl: storeRow.logo_url ?? "" }
        : undefined,
    };
    saveProfile(profile);
    activate(profile);
    return profile;
  }

  async function saveStore(store: StoreProfile) {
    if (!account || account.accountType !== "store") return;
    let persistedStore = store;

    if (isSupabaseConfigured) {
      const supabase = createSupabaseBrowserClient();
      let logoUrl = store.logoUrl;
      if (logoUrl.startsWith("data:")) {
        const blob = await fetch(logoUrl).then((response) => response.blob());
        const path = `${account.id}/logo-${Date.now()}.${blob.type.split("/")[1] ?? "png"}`;
        const { error: uploadError } = await supabase.storage
          .from("store-logos")
          .upload(path, blob, { upsert: true });
        if (uploadError) throw new Error(uploadError.message);
        logoUrl = supabase.storage.from("store-logos").getPublicUrl(path).data.publicUrl;
      }
      const slug = `${store.name
        .toLocaleLowerCase("az")
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${account.id.slice(0, 6)}`;
      const { error } = await supabase.from("stores").insert({
        owner_id: account.id,
        name: store.name,
        slug,
        logo_url: logoUrl,
        status: "pending",
      });
      if (error) throw new Error(error.message);
      persistedStore = { ...store, logoUrl };
    }

    const nextAccount = { ...account, store: persistedStore };
    saveProfile(nextAccount);
    activate(nextAccount);
  }

  function logout() {
    if (isSupabaseConfigured) void createSupabaseBrowserClient().auth.signOut();
    window.localStorage.removeItem(accountSessionKey);
    setAccount(null);
    window.dispatchEvent(new Event(accountChangedEvent));
  }

  const value: AccountContextValue = {
    account,
    ready,
    register,
    login,
    saveStore,
    logout,
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error("useAccount AccountProvider daxilində istifadə olunmalıdır.");
  return context;
}
