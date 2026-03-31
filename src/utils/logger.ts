/**
 * Simple logger with colored output for the agent pipeline
 */

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const AGENT_COLORS: Record<string, string> = {
  Orchestrator: COLORS.magenta,
  ProductAnalyst: COLORS.blue,
  UXResearcher: COLORS.cyan,
  InfoArchitect: COLORS.green,
  ConversationDesigner: COLORS.yellow,
  AIUXSpecialist: COLORS.red,
  InteractionDesigner: COLORS.white,
  UIDesigner: COLORS.bright + COLORS.green,
  DesignReviewer: COLORS.bright + COLORS.red,
};

export function logPhase(phase: number, name: string): void {
  console.log(
    `\n${COLORS.bright}${COLORS.magenta}═══════════════════════════════════════════${COLORS.reset}`
  );
  console.log(
    `${COLORS.bright}${COLORS.magenta}  Phase ${phase}: ${name}${COLORS.reset}`
  );
  console.log(
    `${COLORS.bright}${COLORS.magenta}═══════════════════════════════════════════${COLORS.reset}\n`
  );
}

export function logAgentStart(agentName: string): void {
  const color = AGENT_COLORS[agentName] || COLORS.white;
  console.log(
    `${color}▶ [${agentName}] Starting...${COLORS.reset}`
  );
}

export function logAgentComplete(agentName: string, durationMs: number): void {
  const color = AGENT_COLORS[agentName] || COLORS.white;
  const seconds = (durationMs / 1000).toFixed(1);
  console.log(
    `${color}✔ [${agentName}] Completed in ${seconds}s${COLORS.reset}`
  );
}

export function logAgentError(agentName: string, error: string): void {
  console.log(
    `${COLORS.red}✘ [${agentName}] Error: ${error}${COLORS.reset}`
  );
}

export function logInfo(message: string): void {
  console.log(`${COLORS.dim}  ℹ ${message}${COLORS.reset}`);
}

export function logSuccess(message: string): void {
  console.log(
    `\n${COLORS.bright}${COLORS.green}✔ ${message}${COLORS.reset}\n`
  );
}

export function logWarning(message: string): void {
  console.log(`${COLORS.yellow}⚠ ${message}${COLORS.reset}`);
}

export function logIteration(round: number): void {
  console.log(
    `\n${COLORS.bright}${COLORS.yellow}↻ Iteration Round ${round}${COLORS.reset}\n`
  );
}
