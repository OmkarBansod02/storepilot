"use client";

const ANON_ID_KEY = "storepilot_anon_id";

function createAnonymousId(): string {
  return crypto.randomUUID();
}

export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "";

  const stored = localStorage.getItem(ANON_ID_KEY);
  if (stored) return stored;

  const id = createAnonymousId();
  localStorage.setItem(ANON_ID_KEY, id);

  return id;
}

export function replaceAnonymousId(): string {
  if (typeof window === "undefined") return "";

  const id = createAnonymousId();
  localStorage.setItem(ANON_ID_KEY, id);

  return id;
}
