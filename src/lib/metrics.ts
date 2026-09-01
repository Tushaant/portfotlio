import type { StoredEvent } from "./event-store";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function uniq(ids: string[]) {
  return new Set(ids.filter(Boolean)).size;
}

function median(nums: number[]) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function computeIntelligence(events: StoredEvent[], from: number, to: number) {
  const inRange = events.filter((e) => e.at >= from && e.at <= to);
  const visitors = uniq(inRange.map((e) => e.visitorId));
  const sessions = uniq(inRange.map((e) => e.sessionId));

  const previousFrom = from - (to - from);
  const prev = events.filter((e) => e.at >= previousFrom && e.at < from);
  const prevVisitors = uniq(prev.map((e) => e.visitorId));
  const returning = uniq(
    inRange.filter((e) => prev.some((p) => p.visitorId === e.visitorId)).map((e) => e.visitorId),
  );

  const sessionBounds = new Map<string, { start: number; last: number; engaged: boolean }>();
  for (const e of inRange) {
    const cur = sessionBounds.get(e.sessionId) || {
      start: e.at,
      last: e.at,
      engaged: false,
    };
    cur.start = Math.min(cur.start, e.at);
    cur.last = Math.max(cur.last, e.at);
    if (
      /message_sent$|contact_clicked|linkedin_clicked|resume_/.test(e.name) ||
      e.name === "section_viewed"
    ) {
      cur.engaged = true;
    }
    sessionBounds.set(e.sessionId, cur);
  }
  const durations = [...sessionBounds.values()]
    .map((s) => s.last - s.start)
    .filter((d) => d >= 0 && d < 8 * HOUR);
  const engagedSessions = [...sessionBounds.values()].filter((s) => s.engaged).length;

  const chatMsgs = inRange.filter((e) => e.name === "chat_message_sent");
  const voiceMsgs = inRange.filter((e) => e.name === "voice_message_sent");
  const aiUsers = uniq([...chatMsgs, ...voiceMsgs].map((e) => e.visitorId));
  const voiceUsers = uniq(voiceMsgs.map((e) => e.visitorId));

  const contact = inRange.filter((e) => e.name === "contact_clicked");
  const linkedin = inRange.filter((e) => e.name === "linkedin_clicked");
  const resume = inRange.filter((e) => e.name === "resume_viewed" || e.name === "resume_downloaded");

  function lastTouch(visitorId: string, before: number) {
    const prior = inRange
      .filter(
        (e) =>
          e.visitorId === visitorId &&
          e.at <= before &&
          before - e.at <= DAY &&
          (e.name === "chat_message_sent" || e.name === "voice_message_sent"),
      )
      .sort((a, b) => b.at - a.at)[0];
    return prior;
  }

  const contactAttributed = contact.map((e) => lastTouch(e.visitorId, e.at)).filter(Boolean);
  const uniqueContact = uniq(contact.map((e) => e.visitorId));
  const aiContact = uniq(
    contact.filter((e) => lastTouch(e.visitorId, e.at)).map((e) => e.visitorId),
  );

  const topicMap = new Map<
    string,
    { conversations: Set<string>; visitors: Set<string>; chat: number; voice: number }
  >();
  for (const e of [...chatMsgs, ...voiceMsgs]) {
    const topic = e.topic || "Unclassified";
    const row = topicMap.get(topic) || {
      conversations: new Set(),
      visitors: new Set(),
      chat: 0,
      voice: 0,
    };
    row.conversations.add(e.conversationId || e.sessionId);
    row.visitors.add(e.visitorId);
    if (e.name.startsWith("chat")) row.chat += 1;
    else row.voice += 1;
    topicMap.set(topic, row);
  }

  const topics = [...topicMap.entries()]
    .map(([label, v]) => ({
      label,
      volume: v.conversations.size,
      reach: v.visitors.size,
      chat: v.chat,
      voice: v.voice,
    }))
    .sort((a, b) => b.volume - a.volume);

  const edges: { a: string; b: string; count: number }[] = [];
  const convTopics = new Map<string, Set<string>>();
  for (const e of [...chatMsgs, ...voiceMsgs]) {
    const id = e.conversationId || e.sessionId;
    const set = convTopics.get(id) || new Set();
    if (e.topic) set.add(e.topic);
    convTopics.set(id, set);
  }
  const pair = new Map<string, number>();
  for (const set of convTopics.values()) {
    const list = [...set];
    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        const key = [list[i], list[j]].sort().join("||");
        pair.set(key, (pair.get(key) || 0) + 1);
      }
    }
  }
  for (const [key, count] of pair) {
    if (count < 3) continue;
    const [a, b] = key.split("||");
    edges.push({ a, b, count });
  }

  const clusterMap = new Map<
    string,
    { n: number; visitors: Set<string>; topic: string; intent: string; chat: number; voice: number }
  >();
  for (const e of [...chatMsgs, ...voiceMsgs]) {
    const id = e.cluster || "Other";
    const row = clusterMap.get(id) || {
      n: 0,
      visitors: new Set(),
      topic: e.topic || "Unclassified",
      intent: e.intent || "Portfolio Exploration",
      chat: 0,
      voice: 0,
    };
    row.n += 1;
    row.visitors.add(e.visitorId);
    if (e.name.startsWith("chat")) row.chat += 1;
    else row.voice += 1;
    clusterMap.set(id, row);
  }
  const questions = [...clusterMap.entries()]
    .map(([label, v]) => ({
      label,
      occurrences: v.n,
      visitors: v.visitors.size,
      topic: v.topic,
      intent: v.intent,
      chat: v.chat,
      voice: v.voice,
    }))
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 20);

  const gaps = inRange
    .filter((e) => e.name === "knowledge_gap" || e.properties?.knowledgeGap)
    .reduce((map, e) => {
      const key = String(e.cluster || e.properties?.text || "Unknown").slice(0, 80);
      const row = map.get(key) || { visitors: new Set<string>(), n: 0 };
      row.n += 1;
      row.visitors.add(e.visitorId);
      map.set(key, row);
      return map;
    }, new Map<string, { visitors: Set<string>; n: number }>());

  const knowledgeGaps = [...gaps.entries()]
    .map(([question, v]) => ({
      question,
      frequency: v.n,
      visitors: v.visitors.size,
      coverage: v.visitors.size >= 3 ? "Repeated gap" : "Limited",
    }))
    .filter((g) => g.visitors >= 3);

  const insights: string[] = [];
  if (topics[0] && topics[0].reach >= 5) {
    insights.push(`${topics[0].label} is currently the most explored topic.`);
  }
  if (edges[0]) {
    insights.push(`Visitors asking about ${edges[0].a} also often ask about ${edges[0].b}.`);
  }
  if (voiceMsgs.length && chatMsgs.length && voiceUsers >= 5) {
    insights.push("Voice and Chat are both in use. Compare conversion by last AI touch.");
  }
  if (!insights.length) insights.push("Insufficient data.");

  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);

  return {
    range: { from, to },
    kpis: {
      totalVisitors: visitors,
      uniqueVisitors: visitors,
      returningVisitors: returning,
      returningRate: pct(returning, visitors),
      sessions,
      avgSessionMs: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
      medianSessionMs: Math.round(median(durations)),
      engagementRate: pct(engagedSessions, sessions),
      aiUsers,
      aiEngagementRate: pct(aiUsers, visitors),
      chatSessions: uniq(chatMsgs.map((e) => e.sessionId)),
      voiceSessions: uniq(voiceMsgs.map((e) => e.sessionId)),
      chatOpens: inRange.filter((e) => e.name === "chat_opened").length,
      voiceOpens: inRange.filter((e) => e.name === "voice_opened").length,
      chatMessages: chatMsgs.length,
      voiceMessages: voiceMsgs.length,
      aiConversations: uniq([...chatMsgs, ...voiceMsgs].map((e) => e.conversationId || e.sessionId)),
      contactClicks: contact.length,
      uniqueContact,
      contactRate: pct(uniqueContact, visitors),
      linkedinClicks: linkedin.length,
      resumeActions: resume.length,
      aiToContact: pct(aiContact, aiUsers),
    },
    previousVisitors: prevVisitors,
    attribution: {
      windowHours: 24,
      model: "Last qualifying AI touch",
      contactByAgent: {
        chat: contactAttributed.filter((e) => e?.name === "chat_message_sent").length,
        voice: contactAttributed.filter((e) => e?.name === "voice_message_sent").length,
      },
    },
    topics,
    questions,
    edges,
    knowledgeGaps,
    insights,
    sampleNotes: {
      topicConversion: "Minimum 10 unique visitors associated with a topic.",
      relationship: "Edges require 3 conversations.",
      knowledgeGap: "Repeated gaps require 3 unique visitors.",
    },
  };
}
