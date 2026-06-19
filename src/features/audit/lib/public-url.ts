import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { AuditError } from "./audit-errors";

const blockedHostnames = new Set(["localhost", "0.0.0.0"]);

export async function validatePublicAuditUrl(urlValue: string): Promise<string> {
  const url = new URL(urlValue);
  const hostname = normalizeHostname(url.hostname);

  if (!hostname || isBlockedHostname(hostname)) {
    throw new AuditError("invalid_url", "URL must point to a public website.");
  }

  const ipVersion = isIP(hostname);

  if (ipVersion !== 0) {
    if (isPrivateIpAddress(hostname, ipVersion)) {
      throw new AuditError("invalid_url", "URL must point to a public website.");
    }

    return url.toString();
  }

  let addresses: { address: string; family: number }[];

  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch (error) {
    throw new AuditError(
      "unreachable_page",
      "The URL hostname could not be resolved.",
      error,
    );
  }

  if (addresses.length === 0) {
    throw new AuditError(
      "unreachable_page",
      "The URL hostname could not be resolved.",
    );
  }

  const hasPrivateAddress = addresses.some(({ address, family }) =>
    isPrivateIpAddress(address, family),
  );

  if (hasPrivateAddress) {
    throw new AuditError("invalid_url", "URL must point to a public website.");
  }

  return url.toString();
}

function normalizeHostname(hostname: string): string {
  return hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

function isBlockedHostname(hostname: string): boolean {
  return (
    blockedHostnames.has(hostname) ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  );
}

function isPrivateIpAddress(address: string, family: number): boolean {
  if (family === 4) {
    return isPrivateIpv4Address(address);
  }

  if (family === 6) {
    return isPrivateIpv6Address(address);
  }

  return true;
}

function isPrivateIpv4Address(address: string): boolean {
  const parts = address.split(".").map(Number);

  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) {
    return true;
  }

  const [first, second] = parts;

  if (first === undefined || second === undefined) {
    return true;
  }

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 192 && second === 0) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51) ||
    (first === 203 && second === 0)
  );
}

function isPrivateIpv6Address(address: string): boolean {
  const normalized = address.toLowerCase();

  if (normalized.startsWith("::ffff:")) {
    const mappedIpv4 = normalized.replace("::ffff:", "");
    return isPrivateIpv4Address(mappedIpv4);
  }

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]:/.test(normalized) ||
    normalized.startsWith("ff") ||
    normalized.startsWith("2001:db8:")
  );
}
