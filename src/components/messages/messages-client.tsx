"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  CheckCheck,
  ImagePlus,
  MoreVertical,
  Search,
  Send,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listings } from "@/lib/mock-data";

type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  imageName?: string;
};

type Conversation = {
  id: string;
  name: string;
  status: "online" | "offline";
  preview: string;
  listingId: string;
  unread: number;
  messages: ChatMessage[];
};

const initialConversations: Conversation[] = [
  {
    id: "conv-telefon",
    name: "Telefon Dünyası",
    status: "online",
    preview: "iPhone hələ satışdadır?",
    listingId: "lst-001",
    unread: 1,
    messages: [
      { id: "msg-1", from: "them", text: "Salam, məhsul hələ satışdadır?", time: "13:12" },
      { id: "msg-2", from: "me", text: "Salam, bəli. Mağazada yoxlayıb ala bilərsiniz.", time: "13:14" },
      { id: "msg-3", from: "them", text: "Çatdırılma var?", time: "13:15" },
    ],
  },
  {
    id: "conv-kamran",
    name: "Kamran Vəliyev",
    status: "offline",
    preview: "PS5 üçün qiymətdə endirim olar?",
    listingId: "lst-007",
    unread: 0,
    messages: [
      { id: "msg-4", from: "them", text: "PS5 üçün qiymətdə endirim olar?", time: "12:40" },
      { id: "msg-5", from: "me", text: "Real alıcı üçün kiçik endirim edə bilərəm.", time: "12:45" },
    ],
  },
  {
    id: "conv-city",
    name: "City Home",
    status: "online",
    preview: "Mənzilə baxış vaxtı seçək.",
    listingId: "lst-004",
    unread: 2,
    messages: [
      { id: "msg-6", from: "them", text: "Mənzilə baxış vaxtı seçək.", time: "11:20" },
      { id: "msg-7", from: "me", text: "Bu gün 18:00 uyğundur.", time: "11:26" },
    ],
  },
];

function getCurrentTime() {
  return new Intl.DateTimeFormat("az-AZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function MessagesClient() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return conversations;

    return conversations.filter((conversation) =>
      [conversation.name, conversation.preview]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [conversations, query]);

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];
  const activeListing =
    listings.find((listing) => listing.id === activeConversation?.listingId) ?? listings[0];

  function selectConversation(id: string) {
    setActiveId(id);
    setMenuOpen(false);
    setNotice("");
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, unread: 0 } : conversation,
      ),
    );
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text) {
      setNotice("Mesaj boş ola bilməz.");
      return;
    }

    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== activeConversation.id) return conversation;

        return {
          ...conversation,
          preview: text,
          messages: [
            ...conversation.messages,
            {
              id: `msg-${Date.now()}`,
              from: "me",
              text,
              time: getCurrentTime(),
            },
          ],
        };
      }),
    );
    setDraft("");
    setNotice("Mesaj göndərildi.");
  }

  function attachImage(file: File | undefined) {
    if (!file || !activeConversation) return;

    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== activeConversation.id) return conversation;

        return {
          ...conversation,
          preview: `Şəkil: ${file.name}`,
          messages: [
            ...conversation.messages,
            {
              id: `msg-${Date.now()}`,
              from: "me",
              text: "Şəkil əlavə edildi",
              imageName: file.name,
              time: getCurrentTime(),
            },
          ],
        };
      }),
    );
    setNotice("Şəkil mesaja əlavə edildi.");
  }

  function clearChat() {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversation.id
          ? { ...conversation, messages: [], preview: "Söhbət təmizləndi" }
          : conversation,
      ),
    );
    setMenuOpen(false);
    setNotice("Söhbət təmizləndi.");
  }

  if (!activeConversation || !activeListing) {
    return null;
  }

  return (
    <Card className="grid h-[calc(100vh-250px)] min-h-[680px] overflow-hidden lg:grid-cols-[320px_1fr]">
      <aside className="border-b border-border lg:border-b-0 lg:border-r">
        <div className="border-b border-border p-3">
          <label className="relative block">
            <span className="sr-only">Mesajlarda axtar</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              placeholder="Mesajlarda axtar"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        <div className="max-h-[260px] overflow-y-auto lg:max-h-none">
          {filteredConversations.length ? (
            filteredConversations.map((conversation) => (
              <button
                className={`flex w-full items-center gap-3 border-b border-border p-4 text-left transition ${
                  activeConversation.id === conversation.id
                    ? "bg-primary-soft/60"
                    : "hover:bg-primary-soft/40"
                }`}
                key={conversation.id}
                type="button"
                onClick={() => selectConversation(conversation.id)}
              >
                <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-soft font-black text-primary">
                  {conversation.name[0]}
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${
                      conversation.status === "online" ? "bg-success" : "bg-slate-400"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-bold">{conversation.name}</p>
                    {conversation.unread ? (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                        {conversation.unread}
                      </span>
                    ) : null}
                  </div>
                  <p className="line-clamp-1 text-sm text-muted">{conversation.preview}</p>
                </div>
              </button>
            ))
          ) : (
            <p className="p-4 text-sm text-muted">Uyğun söhbət tapılmadı.</p>
          )}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="font-black">{activeConversation.name}</h2>
            <p
              className={
                activeConversation.status === "online"
                  ? "text-sm text-success"
                  : "text-sm text-muted"
              }
            >
              {activeConversation.status === "online" ? "online · yazır..." : "offline"}
            </p>
          </div>
          <div className="relative">
            <Button
              aria-label="Əlavə menyu"
              size="icon"
              type="button"
              variant="ghost"
              onClick={() => setMenuOpen((current) => !current)}
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
            {menuOpen ? (
              <div className="absolute right-0 top-11 z-10 w-48 rounded-lg border border-border bg-card p-1 shadow-xl">
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-background"
                  type="button"
                  onClick={clearChat}
                >
                  <Trash2 className="h-4 w-4" />
                  Söhbəti təmizlə
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-background"
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setNotice("Şikayət qeydə alındı.");
                  }}
                >
                  <ShieldAlert className="h-4 w-4" />
                  Şikayət et
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-background p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              <Image
                src={activeListing.image}
                alt={activeListing.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="line-clamp-1 font-bold">{activeListing.title}</p>
              <p className="text-sm text-muted">{activeListing.price} AZN</p>
            </div>
          </div>
        </div>

        <div
          className="flex-1 space-y-3 overflow-y-auto bg-background p-4"
          data-testid="message-thread"
        >
          {activeConversation.messages.length ? (
            activeConversation.messages.map((message) => (
              <div
                className={`max-w-[82%] rounded-lg p-3 text-sm shadow-sm ${
                  message.from === "me"
                    ? "ml-auto bg-primary text-white"
                    : "bg-card text-foreground"
                }`}
                key={message.id}
              >
                <p>{message.text}</p>
                {message.imageName ? (
                  <p className="mt-2 rounded-md bg-white/15 px-2 py-1 text-xs font-semibold">
                    {message.imageName}
                  </p>
                ) : null}
                <p
                  className={`mt-2 flex items-center gap-1 text-[11px] ${
                    message.from === "me" ? "text-white/75" : "text-muted"
                  }`}
                >
                  {message.time}
                  {message.from === "me" ? <CheckCheck className="h-3 w-3" /> : null}
                </p>
              </div>
            ))
          ) : (
            <div className="grid h-full place-items-center text-center text-sm text-muted">
              Bu söhbətdə mesaj yoxdur.
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card p-3">
          {notice ? (
            <p
              className={`mb-2 text-sm font-semibold ${
                notice.includes("boş") ? "text-danger" : "text-success"
              }`}
            >
              {notice}
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              type="file"
              onChange={(event) => attachImage(event.target.files?.[0])}
            />
            <Button
              aria-label="Şəkil göndər"
              size="icon"
              type="button"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Mesaj yaz"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (notice) setNotice("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button aria-label="Göndər" size="icon" type="button" onClick={sendMessage}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </Card>
  );
}
