import { lookup } from "node:dns/promises";
import { request as httpRequest, type IncomingMessage } from "node:http";
import { request as httpsRequest } from "node:https";
import { BlockList, isIP } from "node:net";
import { brotliDecompressSync, gunzipSync, inflateSync } from "node:zlib";

const MAX_REDIRECTS = 5;
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;
class PublicConnectionError extends Error {}
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
// These literals define classification ranges; they are never network destinations.
const blockedV4 = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const)
  blockedV4.addSubnet(address, prefix, "ipv4");
const globalV6 = new BlockList();
globalV6.addSubnet("2000::", 3, "ipv6");
const blockedV6 = new BlockList();
for (const [address, prefix] of [
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["3ffe::", 16],
  ["3fff::", 20],
] as const)
  blockedV6.addSubnet(address, prefix, "ipv6");

export class UnsafePublicUrlError extends Error {
  constructor() {
    super("URL must use HTTP(S), contain no credentials, and resolve only to public addresses");
    this.name = "UnsafePublicUrlError";
  }
}

/** Reject special-use addresses, including IPv4-mapped and transition IPv6 ranges. */
export function isPublicAddress(address: string): boolean {
  if (address.includes("%")) return false;
  const family = isIP(address);
  if (family === 4) return !blockedV4.check(address, "ipv4");
  return family === 6 && globalV6.check(address, "ipv6") && !blockedV6.check(address, "ipv6");
}

function hostnameOf(url: URL): string {
  return url.hostname.replace(/^\[|\]$/g, "");
}

async function beforeDeadline<T>(operation: Promise<T>, deadline: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Public URL request timed out")),
          Math.max(0, deadline - Date.now())
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function resolvePublicUrl(
  input: string,
  deadline: number
): Promise<{ url: URL; addresses: Array<{ address: string; family: 4 | 6 }> }> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new UnsafePublicUrlError();
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password)
    throw new UnsafePublicUrlError();
  const hostname = hostnameOf(url);
  const literalFamily = isIP(hostname);
  const addresses = literalFamily
    ? [{ address: hostname, family: literalFamily }]
    : await beforeDeadline(lookup(hostname, { all: true, verbatim: true }), deadline);
  if (!addresses.length || addresses.some((entry) => !isPublicAddress(entry.address)))
    throw new UnsafePublicUrlError();
  return {
    url,
    addresses: addresses.map((entry) => ({
      address: entry.address,
      family: isIP(entry.address) as 4 | 6,
    })),
  };
}

/** Validate before cache access too; cached data is not an authorization bypass. */
export async function validatePublicUrl(input: string): Promise<void> {
  await resolvePublicUrl(input, Date.now() + FETCH_TIMEOUT_MS);
}

function decodeBody(body: Buffer, encoding: string | undefined): string {
  const options = { maxOutputLength: MAX_BODY_BYTES };
  if (!encoding || encoding === "identity") return body.toString("utf8");
  if (encoding === "gzip") return gunzipSync(body, options).toString("utf8");
  if (encoding === "deflate") return inflateSync(body, options).toString("utf8");
  if (encoding === "br") return brotliDecompressSync(body, options).toString("utf8");
  throw new Error("Unsupported public URL content encoding");
}

interface IPage {
  status: number;
  location?: string;
  html: string;
}

function requestPage(
  target: { url: URL; address: string; family: 4 | 6 },
  deadline: number
): Promise<IPage> {
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let settled = false;
    let response: IncomingMessage | undefined;
    const finish = (error?: Error, page?: IPage): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else if (page) resolve(page);
    };
    const requester = target.url.protocol === "https:" ? httpsRequest : httpRequest;
    // Pin the socket to the address we checked. The URL keeps Host and TLS identity,
    // while agent:false prevents reusing a socket from an earlier DNS decision.
    const request = requester(
      target.url,
      {
        agent: false,
        family: target.family,
        lookup: (_hostname, options, callback) => {
          if (options.all) callback(null, [{ address: target.address, family: target.family }]);
          else callback(null, target.address, target.family);
        },
        ...(target.url.protocol === "https:"
          ? { servername: isIP(hostnameOf(target.url)) ? "" : hostnameOf(target.url) }
          : {}),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; DaoDaoMetadata/1.0)",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Encoding": "identity",
        },
      },
      (incoming) => {
        response = incoming;
        const status = incoming.statusCode ?? 502;
        if (REDIRECT_STATUSES.has(status)) {
          finish(undefined, { status, location: incoming.headers.location, html: "" });
          incoming.destroy();
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        incoming.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_BODY_BYTES) {
            const error = new Error("Public URL response exceeds size limit");
            finish(error);
            incoming.destroy();
            request.destroy();
            return;
          }
          chunks.push(Buffer.from(chunk));
        });
        incoming.on("error", (error) => {
          finish(error);
          request.destroy();
        });
        incoming.on("aborted", () => {
          finish(new Error("Public URL response was interrupted"));
          request.destroy();
        });
        incoming.on("end", () => {
          try {
            finish(undefined, {
              status,
              html: decodeBody(Buffer.concat(chunks), incoming.headers["content-encoding"]),
            });
          } catch (error) {
            finish(error instanceof Error ? error : new Error("Invalid public URL body"));
          }
        });
      }
    );
    timer = setTimeout(
      () => {
        const error = new Error("Public URL request timed out");
        finish(error);
        response?.destroy();
        request.destroy();
      },
      Math.max(0, deadline - Date.now())
    );
    request.on("error", (error) =>
      finish(response ? error : new PublicConnectionError(error.message))
    );
    request.end();
  });
}

/** Retry only this hop's already-vetted addresses, without another DNS lookup. */
async function requestVettedAddresses(
  target: Awaited<ReturnType<typeof resolvePublicUrl>>,
  deadline: number
): Promise<IPage> {
  for (const address of target.addresses) {
    if (Date.now() >= deadline) throw new Error("Public URL request timed out");
    try {
      return await requestPage({ url: target.url, ...address }, deadline);
    } catch (error) {
      if (!(error instanceof PublicConnectionError) || address === target.addresses.at(-1))
        throw error;
    }
  }
  throw new Error("No public URL address available");
}

/** Only this transport may fetch user-supplied URLs; validate and pin every hop. */
export async function fetchPublicHtml(input: string): Promise<{ html: string; finalUrl: string }> {
  const deadline = Date.now() + FETCH_TIMEOUT_MS;
  let next = input;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const target = await resolvePublicUrl(next, deadline);
    const page = await requestVettedAddresses(target, deadline);
    if (REDIRECT_STATUSES.has(page.status)) {
      if (!page.location || redirects === MAX_REDIRECTS)
        throw new Error("Public URL redirect limit exceeded");
      next = new URL(page.location, target.url).href;
      continue;
    }
    if (page.status < 200 || page.status >= 300)
      throw new Error(`Failed to fetch URL: ${page.status}`);
    return { html: page.html, finalUrl: target.url.href };
  }
  throw new Error("Public URL redirect limit exceeded");
}
