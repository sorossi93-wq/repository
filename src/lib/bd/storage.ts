import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { SEED_MEETINGS } from "@/data/bd/seed-meetings";
import type { BDDashboardState, Meeting } from "@/lib/bd/types";

const REDIS_KEY = "bd:dashboard";
const LOCAL_FILE = path.join(process.cwd(), "data", "bd-dashboard.json");

let memoryStore: BDDashboardState | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function defaultState(): BDDashboardState {
  return {
    meetings: SEED_MEETINGS,
    lastUpdated: new Date().toISOString(),
    updatedBy: "seed",
  };
}

async function readLocalState(): Promise<BDDashboardState> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf-8");
    const data = JSON.parse(raw) as BDDashboardState;
    if (Array.isArray(data.meetings)) return data;
  } catch {
    /* fall through */
  }
  return memoryStore ?? defaultState();
}

async function writeLocalState(state: BDDashboardState): Promise<void> {
  try {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch {
    memoryStore = state;
    console.warn("Could not persist BD dashboard to disk — using in-memory store.");
  }
}

export async function getBDState(): Promise<BDDashboardState> {
  const redis = getRedis();
  if (redis) {
    const data = await redis.get<BDDashboardState>(REDIS_KEY);
    return data ?? defaultState();
  }
  if (memoryStore) return memoryStore;
  return readLocalState();
}

export async function saveBDState(
  meetings: Meeting[],
  updatedBy?: string
): Promise<BDDashboardState> {
  const state: BDDashboardState = {
    meetings,
    lastUpdated: new Date().toISOString(),
    updatedBy: updatedBy ?? "anonymous",
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(REDIS_KEY, state);
  } else {
    await writeLocalState(state);
  }

  return state;
}

export async function resetBDState(): Promise<BDDashboardState> {
  const state = defaultState();
  const redis = getRedis();
  if (redis) {
    await redis.set(REDIS_KEY, state);
  } else {
    await writeLocalState(state);
  }
  return state;
}
