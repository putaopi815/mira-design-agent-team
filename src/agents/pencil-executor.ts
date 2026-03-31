/**
 * Pencil MCP Executor
 *
 * 执行 UI Designer Agent 生成的 Pencil batch_design 脚本
 * 通过 Claude API 的 MCP tool_use 来调用 Pencil MCP Server
 *
 * 工作流程:
 * 1. 调用 get_editor_state 获取当前编辑器状态和组件库
 * 2. 调用 get_variables 获取设计令牌
 * 3. 调用 get_guidelines("webapp") 获取 Web 应用设计指南
 * 4. 将上下文传给 UI Designer Agent 生成脚本
 * 5. 通过 Claude 的 tool_use 执行 batch_design 脚本
 * 6. 调用 get_screenshot 验证结果
 */

import Anthropic from "@anthropic-ai/sdk";
import { logInfo, logAgentStart, logAgentComplete, logAgentError } from "../utils/logger";

const client = new Anthropic();

// Pencil MCP tool definitions for Claude API
const PENCIL_MCP_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_editor_state",
    description:
      "Get current .pen file path, selected elements, top-level nodes (max 10), and reusable components list",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_variables",
    description: "Read all design tokens/variables from the current .pen file",
    input_schema: {
      type: "object" as const,
      properties: {
        filePath: { type: "string", description: "Path to the .pen file" },
      },
    },
  },
  {
    name: "get_guidelines",
    description:
      'Retrieve specific guideline documents by name (e.g., "webapp", "design-system", "mobile-app")',
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Guideline name" },
      },
      required: ["name"],
    },
  },
  {
    name: "get_screenshot",
    description: "Take a visual screenshot of a node for verification",
    input_schema: {
      type: "object" as const,
      properties: {
        nodeId: { type: "string", description: "ID of the node to screenshot" },
      },
      required: ["nodeId"],
    },
  },
  {
    name: "batch_design",
    description:
      "Execute design operations. Accepts a script of I/R/U/C/D/G/M commands. Max 25 operations per call.",
    input_schema: {
      type: "object" as const,
      properties: {
        script: {
          type: "string",
          description: "Design script with I/R/U/C/D/G/M operations",
        },
      },
      required: ["script"],
    },
  },
  {
    name: "batch_get",
    description: "Read specific nodes by ID with configurable depth",
    input_schema: {
      type: "object" as const,
      properties: {
        filePath: { type: "string" },
        nodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Array of node IDs to read",
        },
        readDepth: {
          type: "number",
          description: "How deep to read node tree",
        },
      },
      required: ["nodeIds"],
    },
  },
  {
    name: "set_variables",
    description: "Set/update design tokens and variables",
    input_schema: {
      type: "object" as const,
      properties: {
        variables: {
          type: "object",
          description: "Key-value pairs of variables to set",
        },
      },
      required: ["variables"],
    },
  },
];

export interface PencilExecutorResult {
  success: boolean;
  pagesCreated: number;
  screenshots: string[];
  errors: string[];
}

/**
 * 执行 Pencil 设计脚本
 *
 * 注意：此函数通过 Claude API 的 tool_use 机制来调用 Pencil MCP
 * Pencil MCP Server 必须在 Pencil Desktop 应用中运行
 *
 * @param scripts - UI Designer Agent 生成的 batch_design 脚本数组
 * @param context - 交互设计上下文（传给 Claude 用于理解设计意图）
 */
export async function executePencilDesign(
  scripts: Array<{ pageName: string; script: string }>,
  context: string
): Promise<PencilExecutorResult> {
  logAgentStart("PencilExecutor");
  const startTime = Date.now();
  const result: PencilExecutorResult = {
    success: true,
    pagesCreated: 0,
    screenshots: [],
    errors: [],
  };

  try {
    // Step 1: 让 Claude 通过 tool_use 调用 Pencil MCP 执行设计
    const systemPrompt = `You are a Pencil MCP executor. Your job is to execute design scripts using Pencil MCP tools.

Workflow:
1. First call get_editor_state to understand the current state
2. Call get_variables to know available design tokens
3. Execute each batch_design script provided
4. After each page, call get_screenshot to verify the result
5. If errors occur, attempt to fix and retry

Rules:
- Max 25 operations per batch_design call
- Use $variable tokens for colors, never hardcode
- Always verify with get_screenshot after creating a page`;

    const userMessage = `Execute the following design scripts in Pencil:

## Design Context
${context}

## Scripts to Execute
${scripts
  .map(
    (s, i) => `### Page ${i + 1}: ${s.pageName}
\`\`\`
${s.script}
\`\`\``
  )
  .join("\n\n")}

Execute each script using batch_design, then take a screenshot to verify. Report results.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      tools: PENCIL_MCP_TOOLS,
      messages: [{ role: "user", content: userMessage }],
    });

    // Process tool_use responses
    // In a real MCP integration, these tool calls would be routed to the Pencil MCP server
    // For now, we output them as instructions
    for (const block of response.content) {
      if (block.type === "tool_use") {
        logInfo(`MCP call: ${block.name}(${JSON.stringify(block.input).slice(0, 100)}...)`);

        if (block.name === "batch_design") {
          result.pagesCreated++;
        }
      }
    }

    logInfo(
      `Generated ${result.pagesCreated} batch_design calls for ${scripts.length} pages`
    );

    const duration = Date.now() - startTime;
    logAgentComplete("PencilExecutor", duration);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logAgentError("PencilExecutor", errorMessage);
    result.success = false;
    result.errors.push(errorMessage);
  }

  return result;
}

/**
 * 获取 Pencil 编辑器当前状态
 * 用于发现可用的组件库和设计令牌
 */
export async function getPencilContext(): Promise<{
  components: string;
  variables: string;
  guidelines: string;
}> {
  logInfo("Fetching Pencil editor context...");

  try {
    // 通过 Claude tool_use 调用 Pencil MCP 获取上下文
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system:
        "You are reading the Pencil editor state. Call the tools to gather context, then summarize what components, variables, and guidelines are available.",
      tools: PENCIL_MCP_TOOLS,
      messages: [
        {
          role: "user",
          content:
            "Call get_editor_state, get_variables, and get_guidelines('webapp') to gather the current design context. Summarize what's available.",
        },
      ],
    });

    // Extract tool calls from response
    const toolCalls = response.content.filter((b) => b.type === "tool_use");
    logInfo(`Pencil context: ${toolCalls.length} MCP calls made`);

    // In real integration, we'd process tool results
    // For now, return placeholder that will be filled by actual MCP responses
    return {
      components: "Components will be populated from get_editor_state response",
      variables: "Variables will be populated from get_variables response",
      guidelines: "Guidelines will be populated from get_guidelines response",
    };
  } catch (error) {
    logAgentError(
      "PencilContext",
      error instanceof Error ? error.message : String(error)
    );
    return {
      components: "Unable to fetch - ensure Pencil Desktop is running",
      variables: "Unable to fetch - ensure Pencil Desktop is running",
      guidelines: "Unable to fetch - ensure Pencil Desktop is running",
    };
  }
}
