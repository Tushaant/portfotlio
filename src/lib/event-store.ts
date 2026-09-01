import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { classifyQuestion } from "./classify";

export type StoredEvent = {
  name: string;
  at: number;
  visitorId: string;
  sessionId: string;
  conversationId?: string | null;
  agentType?: string | null;
  properties: Record<string, unknown>;
  topic?: string;
  intent?: string;
  cluster?: string;
  confidence?: number;
};

const FILE = path.join(process.cwd(), "data", "analytics-events.json");
const TMP = "/tmp/portfotlio-events.json";

let memory: StoredEvent[] = [];

async function readFrom(file: string): Promise<StoredEvent[]> {
  try {
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as StoredEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function loadEvents(): Promise<StoredEvent[]> {
  if (memory.length) return memory;
  const disk = await readFrom(FILE);
  const tmp = disk.length ? [] : await readFrom(TMP);
  memory = (disk.length ? disk : tmp).slice(-5000);
  return memory;
}

export async function appendEvent(event: StoredEvent) {
  const next = { ...event };
  const text = String(event.properties?.text || "");
  if (text && /message_sent$/.test(event.name)) {
    const c = classifyQuestion(text);
    next.topic = c.topic;
    next.intent = c.intent;
    next.cluster = c.cluster;
    next.confidence = c.confidence;
  }
  const all = await loadEvents();
  all.push(next);
  memory = all.slice(-5000);
  const body = JSON.stringify(memory);
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, body);
  } catch {
    try {
      await writeFile(TMP, body);
    } catch {
      /* memory only */
    }
  }
  return next;
}
