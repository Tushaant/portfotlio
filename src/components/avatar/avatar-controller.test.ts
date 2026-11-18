import assert from "node:assert/strict";
import { avatarController, avatarPose, visemeFor } from "./avatar-controller.ts";

assert.equal(visemeFor("a").viseme, "aa");
assert.equal(visemeFor("e").open > visemeFor("m").open, true);
assert.equal(visemeFor(" ").viseme, "sil");

avatarController.setState("speaking");
avatarController.applySpeechSample("o");
assert.equal(avatarPose.speaking, true);
assert.equal(avatarPose.viseme, "O");
assert.ok(avatarPose.mouthOpen > 0.6);
avatarController.setState("listening");
assert.equal(avatarPose.mouthOpen, 0);

console.log("avatar-controller tests passed");
