import Anthropic from "@anthropic-ai/sdk";
import { AgentResult } from "../types";
import { logAgentStart, logAgentComplete, logAgentError } from "../utils/logger";

const client = new Anthropic();

export interface AgentConfig {
  name: string;
  systemPrompt: string;
  model?: string;
  maxTokens?: number;
}

/**
 * Base agent runner — sends a prompt to Claude and parses the JSON response
 */
export async function runAgent<T>(
  config: AgentConfig,
  userMessage: string
): Promise<AgentResult<T>> {
  const startTime = Date.now();
  logAgentStart(config.name);

  try {
    const response = await client.messages.create({
      model: config.model || "claude-sonnet-4-20250514",
      max_tokens: config.maxTokens || 8192,
      system: config.systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type: " + content.type);
    }

    // Extract JSON from the response (handle markdown code blocks)
    let jsonText = content.text.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    const output = JSON.parse(jsonText) as T;
    const duration = Date.now() - startTime;
    logAgentComplete(config.name, duration);

    return {
      agentName: config.name,
      success: true,
      output,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    logAgentError(config.name, errorMessage);

    return {
      agentName: config.name,
      success: false,
      error: errorMessage,
      duration,
    };
  }
}

/**
 * Run multiple agents in parallel
 */
export async function runAgentsParallel<T>(
  agents: Array<{ config: AgentConfig; message: string }>
): Promise<AgentResult<T>[]> {
  return Promise.all(
    agents.map(({ config, message }) => runAgent<T>(config, message))
  );
}
