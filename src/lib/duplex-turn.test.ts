import assert from "node:assert/strict";
import { classifyHeard, isAgentEcho, transitionVoicePhase } from "./duplex-turn.ts";

const spoken = "I lead product strategy and roadmaps at Oraczen.";

assert.equal(isAgentEcho("product strategy", spoken), true);
assert.equal(isAgentEcho("no", spoken), false);
assert.equal(classifyHeard("product strategy", spoken), "echo");
assert.equal(classifyHeard("no", spoken), "user");
assert.equal(classifyHeard("wait", spoken), "user");
assert.equal(classifyHeard("wait tell me about ivy", spoken), "user");
assert.equal(classifyHeard("yes", spoken), "echo");
assert.equal(classifyHeard("um", ""), "noise");
assert.equal(classifyHeard("tell me about your experience", ""), "user");

assert.equal(transitionVoicePhase("idle", "session"), "listening");
assert.equal(transitionVoicePhase("listening", "utterance"), "thinking");
assert.equal(transitionVoicePhase("thinking", "reply"), "speaking");
assert.equal(transitionVoicePhase("speaking", "onset"), "interrupted");
assert.equal(transitionVoicePhase("interrupted", "resume"), "listening");
assert.equal(transitionVoicePhase("speaking", "end"), "idle");

console.log("duplex-turn tests passed");
