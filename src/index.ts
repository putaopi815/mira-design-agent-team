import { runDesignPipeline } from "./agents/orchestrator";
import { ProductRequirement, DesignPipelineOutput } from "./types";
import { logSuccess, logInfo } from "./utils/logger";
import * as fs from "fs";
import * as path from "path";

/**
 * Mira Design Agent Team
 *
 * 9-agent pipeline: from product requirements to high-fidelity UI designs
 *
 * Usage:
 *   npx tsx src/index.ts <requirement-file.json>
 *   npx tsx src/index.ts --text "your product requirement text"
 */

async function main(): Promise<void> {
  console.log(`
╔══════════════════════════════════════════════╗
║       🎨 Mira Design Agent Team             ║
║  From Requirements to High-Fidelity UI      ║
╚══════════════════════════════════════════════╝
  `);

  const requirement = parseInput();

  logInfo(`Project: ${requirement.title}`);
  logInfo(`Starting 9-agent design pipeline...\n`);

  const startTime = Date.now();
  const result = await runDesignPipeline(requirement);
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);

  // Save output
  const outputDir = path.resolve("output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outputPath = path.join(outputDir, `design-output-${timestamp}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");

  // Save individual agent outputs for easy reading
  saveIndividualOutputs(outputDir, timestamp, result);

  logSuccess(`Pipeline completed in ${totalDuration}s`);
  logInfo(`Full output: ${outputPath}`);
  logInfo(`Individual outputs: ${outputDir}/${timestamp}/`);

  // Print summary
  printSummary(result);
}

function parseInput(): ProductRequirement {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Demo mode with sample requirement
    console.log("No input provided. Using demo requirement.\n");
    console.log('Usage: npx tsx src/index.ts <requirement.json>');
    console.log('       npx tsx src/index.ts --text "requirement text"\n');

    return {
      title: "Mira AI Agent Orchestration Platform",
      description: `Mira is an AI Agent orchestration platform that allows users to create, configure,
and manage teams of AI agents. Users can define agent roles, set up workflows,
and monitor agent execution in real-time. The platform should support:
- Creating and configuring individual AI agents with specific roles and capabilities
- Building multi-agent workflows with visual drag-and-drop
- Real-time monitoring of agent execution with streaming output
- Conversation interface for interacting with agent teams
- Template library for common agent team configurations
- History and analytics of agent team executions`,
      targetUsers: "Product managers, developers, and business analysts who want to automate complex workflows using AI agent teams",
      platforms: ["web"],
      constraints: [
        "Must support real-time streaming of agent outputs",
        "Must handle multiple concurrent agent executions",
        "Must provide clear visibility into agent decision-making process",
      ],
    };
  }

  if (args[0] === "--text") {
    const text = args.slice(1).join(" ");
    return {
      title: "Product Requirement",
      description: text,
    };
  }

  // Treat as file path
  const filePath = path.resolve(args[0]);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as ProductRequirement;
}

function saveIndividualOutputs(
  outputDir: string,
  timestamp: string,
  result: DesignPipelineOutput
): void {
  const dir = path.join(outputDir, timestamp);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const outputs: Record<string, unknown> = {
    "01-product-analysis": result.productAnalysis,
    "02-ux-research": result.uxResearch,
    "03-info-architecture": result.infoArchitecture,
    "04-conversation-design": result.conversationDesign,
    "05-ai-ux-design": result.aiuxDesign,
    "06-interaction-design": result.interactionDesign,
    "07-ui-design": result.uiDesign,
    "08-design-review": result.designReview,
  };

  for (const [name, data] of Object.entries(outputs)) {
    const filePath = path.join(dir, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }
}

function printSummary(result: DesignPipelineOutput): void {
  console.log(`
╔══════════════════════════════════════════════╗
║              Pipeline Summary                ║
╠══════════════════════════════════════════════╣
║ Features identified:    ${String(result.productAnalysis.features?.length || 0).padStart(4)}               ║
║ User personas:          ${String(result.uxResearch.personas?.length || 0).padStart(4)}               ║
║ Dialog flows:           ${String(result.conversationDesign.dialogFlows?.length || 0).padStart(4)}               ║
║ Page layouts:           ${String(result.interactionDesign.pageLayouts?.length || 0).padStart(4)}               ║
║ UI pages designed:      ${String(result.uiDesign.pages?.length || 0).padStart(4)}               ║
╠══════════════════════════════════════════════╣
║ Review Score                                 ║
║   Usability:            ${String(result.designReview.overallScore?.usability || "-").padStart(4)}               ║
║   AI Experience:        ${String(result.designReview.overallScore?.aiExperience || "-").padStart(4)}               ║
║   Overall:              ${String(result.designReview.overallScore?.overall || "-").padStart(4)}               ║
║   Approved:             ${String(result.designReview.approved ? " Yes" : "  No").padStart(4)}               ║
╚══════════════════════════════════════════════╝
  `);
}

main().catch((error) => {
  console.error("Pipeline failed:", error);
  process.exit(1);
});
