import { runAgent, runAgentsParallel } from "./base-agent";
import {
  ProductRequirement,
  ProductAnalysisOutput,
  UXResearchOutput,
  InfoArchitectureOutput,
  ConversationDesignOutput,
  AIUXSpecialistOutput,
  InteractionDesignOutput,
  UIDesignOutput,
  DesignReviewOutput,
  DesignPipelineOutput,
  AgentResult,
} from "../types";
import {
  PRODUCT_ANALYST_PROMPT,
  UX_RESEARCHER_PROMPT,
  INFO_ARCHITECT_PROMPT,
  CONVERSATION_DESIGNER_PROMPT,
  AI_UX_SPECIALIST_PROMPT,
  INTERACTION_DESIGNER_PROMPT,
  UI_DESIGNER_PROMPT,
  DESIGN_REVIEWER_PROMPT,
} from "../prompts";
import {
  logPhase,
  logInfo,
  logSuccess,
  logWarning,
  logIteration,
} from "../utils/logger";

const MAX_ITERATIONS = 3;

/**
 * Main orchestrator — runs the full design pipeline
 */
export async function runDesignPipeline(
  requirement: ProductRequirement
): Promise<DesignPipelineOutput> {
  const requirementText = formatRequirement(requirement);

  // ============================================
  // Phase 1: Analysis (parallel)
  // ============================================
  logPhase(1, "Analysis — Product Analyst + UX Researcher");

  const [productAnalysisResult, uxResearchResult] = await runAgentsParallel<
    ProductAnalysisOutput | UXResearchOutput
  >([
    {
      config: {
        name: "ProductAnalyst",
        systemPrompt: PRODUCT_ANALYST_PROMPT,
      },
      message: `Analyze the following product requirement:\n\n${requirementText}`,
    },
    {
      config: {
        name: "UXResearcher",
        systemPrompt: UX_RESEARCHER_PROMPT,
      },
      message: `Conduct UX research for the following product requirement:\n\n${requirementText}`,
    },
  ]);

  assertSuccess(productAnalysisResult);
  assertSuccess(uxResearchResult);

  const productAnalysis = productAnalysisResult.output as ProductAnalysisOutput;
  const uxResearch = uxResearchResult.output as UXResearchOutput;

  logInfo(`Product Analyst: ${productAnalysis.features?.length || 0} features identified`);
  logInfo(`UX Researcher: ${uxResearch.personas?.length || 0} personas created`);

  // ============================================
  // Phase 2: Structure (depends on Phase 1)
  // ============================================
  logPhase(2, "Structure — Info Architect");

  const infoArchResult = await runAgent<InfoArchitectureOutput>(
    {
      name: "InfoArchitect",
      systemPrompt: INFO_ARCHITECT_PROMPT,
    },
    `Design the information architecture based on:

## Product Requirement
${requirementText}

## Product Analysis
${JSON.stringify(productAnalysis, null, 2)}

## UX Research
${JSON.stringify(uxResearch, null, 2)}`
  );

  assertSuccess(infoArchResult);
  const infoArchitecture = infoArchResult.output as InfoArchitectureOutput;
  logInfo(`Info Architect: Site map with ${countNodes(infoArchitecture.siteMap)} pages`);

  // ============================================
  // Phase 3: AI + Conversation Design (parallel, depends on Phase 1)
  // ============================================
  logPhase(3, "AI Design — Conversation Designer + AI UX Specialist");

  const phase1Context = `
## Product Requirement
${requirementText}

## Product Analysis
${JSON.stringify(productAnalysis, null, 2)}

## UX Research
${JSON.stringify(uxResearch, null, 2)}`;

  const [conversationResult, aiuxResult] = await runAgentsParallel<
    ConversationDesignOutput | AIUXSpecialistOutput
  >([
    {
      config: {
        name: "ConversationDesigner",
        systemPrompt: CONVERSATION_DESIGNER_PROMPT,
      },
      message: `Design conversation flows based on:\n${phase1Context}`,
    },
    {
      config: {
        name: "AIUXSpecialist",
        systemPrompt: AI_UX_SPECIALIST_PROMPT,
      },
      message: `Design AI UX patterns based on:\n${phase1Context}`,
    },
  ]);

  assertSuccess(conversationResult);
  assertSuccess(aiuxResult);

  const conversationDesign = conversationResult.output as ConversationDesignOutput;
  const aiuxDesign = aiuxResult.output as AIUXSpecialistOutput;

  logInfo(`Conversation Designer: ${conversationDesign.dialogFlows?.length || 0} dialog flows`);
  logInfo(`AI UX Specialist: Designed ${Object.keys(aiuxDesign).length - 1} AI UX dimensions`);

  // ============================================
  // Phase 4: Interaction Synthesis (depends on Phase 2 + 3)
  // ============================================
  logPhase(4, "Interaction Synthesis — Interaction Designer");

  const interactionResult = await runAgent<InteractionDesignOutput>(
    {
      name: "InteractionDesigner",
      systemPrompt: INTERACTION_DESIGNER_PROMPT,
      maxTokens: 8192,
    },
    `Synthesize all upstream outputs into interaction specifications:

## Product Requirement
${requirementText}

## Product Analysis
${JSON.stringify(productAnalysis, null, 2)}

## UX Research
${JSON.stringify(uxResearch, null, 2)}

## Information Architecture
${JSON.stringify(infoArchitecture, null, 2)}

## Conversation Design
${JSON.stringify(conversationDesign, null, 2)}

## AI UX Patterns
${JSON.stringify(aiuxDesign, null, 2)}`
  );

  assertSuccess(interactionResult);
  let interactionDesign = interactionResult.output as InteractionDesignOutput;
  logInfo(`Interaction Designer: ${interactionDesign.pageLayouts?.length || 0} page layouts`);

  // ============================================
  // Phase 5: Visual Execution (depends on Phase 4)
  // ============================================
  logPhase(5, "Visual Execution — UI Designer (Pencil MCP)");

  const uiResult = await runAgent<UIDesignOutput>(
    {
      name: "UIDesigner",
      systemPrompt: UI_DESIGNER_PROMPT,
      maxTokens: 8192,
    },
    `Create high-fidelity UI designs based on interaction specifications:

## Interaction Design
${JSON.stringify(interactionDesign, null, 2)}

## Information Architecture
${JSON.stringify(infoArchitecture, null, 2)}

## AI UX Patterns
${JSON.stringify(aiuxDesign, null, 2)}

## Conversation Design
${JSON.stringify(conversationDesign, null, 2)}

Note: Use Pencil MCP to read the component library and create designs.`
  );

  assertSuccess(uiResult);
  let uiDesign = uiResult.output as UIDesignOutput;
  logInfo(`UI Designer: ${uiDesign.pages?.length || 0} pages designed`);

  // ============================================
  // Phase 6: Review + Iteration
  // ============================================
  logPhase(6, "Design Review");

  let designReview: DesignReviewOutput | null = null;
  let iterationCount = 0;

  while (iterationCount < MAX_ITERATIONS) {
    const reviewResult = await runAgent<DesignReviewOutput>(
      {
        name: "DesignReviewer",
        systemPrompt: DESIGN_REVIEWER_PROMPT,
        maxTokens: 8192,
      },
      `Review the following design outputs:

## Product Requirement
${requirementText}

## Interaction Design
${JSON.stringify(interactionDesign, null, 2)}

## UI Design
${JSON.stringify(uiDesign, null, 2)}

## AI UX Patterns
${JSON.stringify(aiuxDesign, null, 2)}

## Conversation Design
${JSON.stringify(conversationDesign, null, 2)}`
    );

    assertSuccess(reviewResult);
    designReview = reviewResult.output as DesignReviewOutput;

    logInfo(`Review Score — Usability: ${designReview.overallScore.usability}, AI UX: ${designReview.overallScore.aiExperience}, Overall: ${designReview.overallScore.overall}`);

    if (designReview.approved) {
      logSuccess("Design APPROVED by reviewer!");
      break;
    }

    iterationCount++;
    if (iterationCount >= MAX_ITERATIONS) {
      logWarning(`Max iterations (${MAX_ITERATIONS}) reached. Proceeding with current design.`);
      break;
    }

    logIteration(iterationCount);

    const criticalIssues = designReview.iterationRequired.filter(
      (i) => i.priority === "critical"
    );
    logWarning(`${criticalIssues.length} critical issues require iteration`);

    // Re-run interaction designer with feedback
    const iterationFeedback = designReview.iterationRequired
      .map((i) => `- [${i.priority}] ${i.targetAgent}: ${i.issue} → ${i.action}`)
      .join("\n");

    const interactionIterResult = await runAgent<InteractionDesignOutput>(
      {
        name: "InteractionDesigner",
        systemPrompt: INTERACTION_DESIGNER_PROMPT,
        maxTokens: 8192,
      },
      `Revise the interaction design based on reviewer feedback:

## Current Interaction Design
${JSON.stringify(interactionDesign, null, 2)}

## Reviewer Feedback
${iterationFeedback}

## Original Context
Product Requirement: ${requirementText}
Info Architecture: ${JSON.stringify(infoArchitecture, null, 2)}`
    );

    if (interactionIterResult.success && interactionIterResult.output) {
      interactionDesign = interactionIterResult.output as InteractionDesignOutput;
    }

    // Re-run UI designer with updated interaction design
    const uiIterResult = await runAgent<UIDesignOutput>(
      {
        name: "UIDesigner",
        systemPrompt: UI_DESIGNER_PROMPT,
        maxTokens: 8192,
      },
      `Revise the UI design based on updated interaction specifications:

## Updated Interaction Design
${JSON.stringify(interactionDesign, null, 2)}

## Reviewer Feedback
${iterationFeedback}

## AI UX Patterns
${JSON.stringify(aiuxDesign, null, 2)}`
    );

    if (uiIterResult.success && uiIterResult.output) {
      uiDesign = uiIterResult.output as UIDesignOutput;
    }
  }

  // ============================================
  // Final Compilation
  // ============================================
  logSuccess("Design Pipeline Complete!");

  return {
    requirement,
    productAnalysis,
    uxResearch,
    infoArchitecture,
    conversationDesign,
    aiuxDesign,
    interactionDesign,
    uiDesign,
    designReview: designReview!,
  };
}

// ============================================
// Helpers
// ============================================

function formatRequirement(req: ProductRequirement): string {
  let text = `# ${req.title}\n\n${req.description}`;
  if (req.targetUsers) text += `\n\n## Target Users\n${req.targetUsers}`;
  if (req.platforms?.length) text += `\n\n## Platforms\n${req.platforms.join(", ")}`;
  if (req.constraints?.length)
    text += `\n\n## Constraints\n${req.constraints.map((c) => `- ${c}`).join("\n")}`;
  if (req.references?.length)
    text += `\n\n## References\n${req.references.map((r) => `- ${r}`).join("\n")}`;
  return text;
}

function assertSuccess(result: AgentResult): void {
  if (!result.success) {
    throw new Error(`Agent [${result.agentName}] failed: ${result.error}`);
  }
}

function countNodes(node: { children?: unknown[] }): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children as { children?: unknown[] }[]) {
      count += countNodes(child);
    }
  }
  return count;
}
