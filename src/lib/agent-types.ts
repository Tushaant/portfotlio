export type AgentChannel = "chat" | "voice";
export type AgentTurn = { role: "user" | "assistant"; content: string };
export type AgentOptions = {
  channel?: AgentChannel;
  history?: AgentTurn[];
};
