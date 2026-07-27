import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import type { SoldOutEntry } from "./types";

const REDIS_KEY = "registry:sold-out";
const LOCAL_FILE = path.join(process.cwd(), "data", "claims.json");

let memoryStore: SoldOutEntry[] | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function readLocalClaims(): Promise<SoldOutEntry[]> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf-8");
    const data = JSON.parse(raw) as { soldOut?: SoldOutEntry[] };
    return data.soldOut ?? [];
  } catch {
    return memoryStore ?? [];
  }
}

async function writeLocalClaims(entries: SoldOutEntry[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(
      LOCAL_FILE,
      JSON.stringify({ soldOut: entries }, null, 2),
      "utf-8"
    );
  } catch {
    memoryStore = entries;
    console.warn(
      "Could not persist claims to disk — using in-memory store. Configure Upstash Redis for production."
    );
  }
}

export async function getSoldOutClaims(): Promise<SoldOutEntry[]> {
  const redis = getRedis();
  if (redis) {
    const data = await redis.get<SoldOutEntry[]>(REDIS_KEY);
    return data ?? [];
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
    await redis.set(REDIS_KEY, updated);
  } else {
    await writeLocalClaims(updated);
  }

  return { success: true, entry };
}

export async function isGiftSoldOut(giftId: string): Promise<boolean> {
  const claims = await getSoldOutClaims();
  return claims.some((c) => c.giftId === giftId);
}
