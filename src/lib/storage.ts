import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import type { SoldOutEntry } from "./types";

const REDIS_KEY = "registry:sold-out";
const LOCAL_FILE = path.join(process.cwd(), "data", "claims.json");
const TMP_FILE = path.join("/tmp", "registry-claims.json");

let memoryStore: SoldOutEntry[] | null = null;

function claimsFilePath(): string {
  return process.env.VERCEL ? TMP_FILE : LOCAL_FILE;
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token || !url.startsWith("http")) return null;
  try {
    return new Redis({ url, token });
  } catch (err) {
    console.error("[claims] Redis client could not be created", err);
    return null;
  }
}

async function readJsonClaims(file: string): Promise<SoldOutEntry[] | null> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    const data = JSON.parse(raw) as { soldOut?: SoldOutEntry[] };
    return data.soldOut ?? [];
  } catch {
    return null;
  }
}

async function readLocalClaims(): Promise<SoldOutEntry[]> {
  const primary = await readJsonClaims(claimsFilePath());
  if (primary) return primary;
  if (!process.env.VERCEL) {
    const seeded = await readJsonClaims(LOCAL_FILE);
    if (seeded) return seeded;
  }
  return memoryStore ?? [];
}

async function writeLocalClaims(entries: SoldOutEntry[]): Promise<void> {
  memoryStore = entries;
  try {
    const file = claimsFilePath();
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify({ soldOut: entries }, null, 2), "utf-8");
  } catch (err) {
    console.warn(
      "[claims] Could not persist claims to disk — using in-memory store.",
      err instanceof Error ? err.message : err
    );
  }
}

export async function getSoldOutClaims(): Promise<SoldOutEntry[]> {
  const redis = getRedis();
  if (redis) {
    try {
      const data = await redis.get<SoldOutEntry[]>(REDIS_KEY);
      if (Array.isArray(data)) {
        memoryStore = data;
        return data;
      }
    } catch (err) {
      console.error("[claims] Redis read failed, falling back to file/memory", err);
    }
  }
  if (memoryStore) return memoryStore;
  return readLocalClaims();
}

export async function claimGift(
  giftId: string,
  giftedBy: string
): Promise<{ success: boolean; alreadyClaimed?: boolean; entry?: SoldOutEntry }> {
  const existing = await getSoldOutClaims();
  const found = existing.find((e) => e.giftId === giftId);
  if (found) {
    return { success: false, alreadyClaimed: true, entry: found };
  }

  const entry: SoldOutEntry = {
    giftId,
    giftedBy,
    claimedAt: new Date().toISOString(),
  };

  const updated = [...existing, entry];
  const redis = getRedis();

  if (redis) {
    try {
      await redis.set(REDIS_KEY, updated);
      memoryStore = updated;
      return { success: true, entry };
    } catch (err) {
      console.error("[claims] Redis write failed, falling back to file/memory", err);
    }
  }

  await writeLocalClaims(updated);
  return { success: true, entry };
}

export async function isGiftSoldOut(giftId: string): Promise<boolean> {
  try {
    const claims = await getSoldOutClaims();
    return claims.some((c) => c.giftId === giftId);
  } catch (err) {
    console.error("[claims] isGiftSoldOut failed — treating as available", err);
    return false;
  }
}
