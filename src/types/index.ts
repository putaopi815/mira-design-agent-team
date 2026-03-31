/**
 * Mira Design Agent Team - 类型定义
 * 定义所有 Agent 之间的数据传递接口
 */

// ============================================
// 输入：产品需求文档
// ============================================
export interface ProductRequirement {
  title: string;
  description: string;
  targetUsers?: string;
  platforms?: string[];
  constraints?: string[];
  references?: string[];
}

// ============================================
// Agent 1: Product Analyst 产出
// ============================================
export interface ProductAnalysisOutput {
  agentName: "ProductAnalyst";
  features: FeatureItem[];
  userStories: UserStory[];
  priorityMatrix: PriorityItem[];
  edgeCases: EdgeCase[];
  acceptanceCriteria: AcceptanceCriterion[];
}

export interface FeatureItem {
  id: string;
  name: string;
  description: string;
  module: string;
  priority: "must" | "should" | "could" | "wont";
}

export interface UserStory {
  id: string;
  persona: string;
  want: string;
  soThat: string;
  featureId: string;
}

export interface PriorityItem {
  featureId: string;
  userValue: "high" | "medium" | "low";
  complexity: "high" | "medium" | "low";
  priority: "P0" | "P1" | "P2" | "P3";
}

export interface EdgeCase {
  id: string;
  featureId: string;
  scenario: string;
  type: "ai_timeout" | "ai_hallucination" | "ai_refusal" | "permission" | "network" | "other";
  expectedBehavior: string;
}

export interface AcceptanceCriterion {
  featureId: string;
  given: string;
  when: string;
  then: string;
}

// ============================================
// Agent 2: UX Researcher 产出
// ============================================
export interface UXResearchOutput {
  agentName: "UXResearcher";
  personas: Persona[];
  userJourneyMap: UserJourneyMap;
  competitiveAnalysis: CompetitiveAnalysis;
  heuristicEvaluation: HeuristicEvaluation;
  mentalModelAnalysis: MentalModelAnalysis;
}

export interface Persona {
  name: string;
  role: string;
  goals: string[];
  painPoints: string[];
  techLevel: "beginner" | "intermediate" | "advanced";
  aiLiteracy: "low" | "medium" | "high";
  scenarios: string[];
}

export interface UserJourneyMap {
  stages: JourneyStage[];
}

export interface JourneyStage {
  name: string;
  actions: string[];
  thoughts: string[];
  emotions: string[];
  painPoints: string[];
  opportunities: string[];
}

export interface CompetitiveAnalysis {
  competitors: CompetitorProfile[];
  insights: string[];
  differentiators: string[];
}

export interface CompetitorProfile {
  name: string;
  strengths: string[];
  weaknesses: string[];
  uxPatterns: string[];
}

export interface HeuristicEvaluation {
  principles: HeuristicItem[];
  overallScore: number;
  criticalIssues: string[];
}

export interface HeuristicItem {
  principle: string; // Nielsen's 10 heuristics
  score: number; // 1-5
  findings: string[];
  recommendations: string[];
}

export interface MentalModelAnalysis {
  userModel: string;
  systemModel: string;
  gaps: string[];
  alignmentStrategies: string[];
}

// ============================================
// Agent 3: Info Architect 产出
// ============================================
export interface InfoArchitectureOutput {
  agentName: "InfoArchitect";
  siteMap: SiteMapNode;
  navigationStructure: NavigationStructure;
  contentModel: ContentModel[];
  namingConventions: NamingConvention[];
  agentWorkflowTopology: WorkflowTopology;
}

export interface SiteMapNode {
  id: string;
  label: string;
  path?: string;
  children?: SiteMapNode[];
  description?: string;
}

export interface NavigationStructure {
  primaryNav: NavItem[];
  secondaryNav?: NavItem[];
  breadcrumbs: boolean;
  quickActions?: NavItem[];
}

export interface NavItem {
  label: string;
  icon?: string;
  path: string;
  children?: NavItem[];
}

export interface ContentModel {
  pageId: string;
  pageName: string;
  sections: ContentSection[];
}

export interface ContentSection {
  name: string;
  type: "header" | "list" | "form" | "chat" | "visualization" | "card" | "table" | "empty_state";
  description: string;
  dataSource?: string;
}

export interface NamingConvention {
  element: string;
  currentName: string;
  reasoning: string;
}

export interface WorkflowTopology {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  description: string;
}

export interface WorkflowNode {
  id: string;
  label: string;
  type: "agent" | "user" | "system" | "decision";
}

export interface WorkflowEdge {
  from: string;
  to: string;
  label?: string;
  condition?: string;
}

// ============================================
// Agent 4: Conversation Designer 产出
// ============================================
export interface ConversationDesignOutput {
  agentName: "ConversationDesigner";
  dialogFlows: DialogFlow[];
  intentStateMachine: IntentStateMachine;
  fallbackStrategies: FallbackStrategy[];
  agentPersonality: AgentPersonality;
  multimodalPatterns: MultimodalPattern[];
}

export interface DialogFlow {
  id: string;
  name: string;
  trigger: string;
  steps: DialogStep[];
}

export interface DialogStep {
  actor: "user" | "agent" | "system";
  action: string;
  content?: string;
  branches?: DialogBranch[];
  nextStep?: string;
}

export interface DialogBranch {
  condition: string;
  nextStep: string;
}

export interface IntentStateMachine {
  states: IntentState[];
  transitions: IntentTransition[];
}

export interface IntentState {
  id: string;
  name: string;
  type: "initial" | "active" | "waiting" | "completed" | "error";
  description: string;
}

export interface IntentTransition {
  from: string;
  to: string;
  trigger: string;
  action?: string;
}

export interface FallbackStrategy {
  scenario: string;
  type: "clarify" | "suggest" | "escalate" | "retry" | "graceful_exit";
  response: string;
  followUp?: string;
}

export interface AgentPersonality {
  name: string;
  tone: string;
  communicationStyle: string;
  doList: string[];
  dontList: string[];
  sampleResponses: SampleResponse[];
}

export interface SampleResponse {
  scenario: string;
  response: string;
}

export interface MultimodalPattern {
  inputType: "text" | "image" | "file" | "voice" | "structured_card";
  outputType: "text" | "image" | "file" | "chart" | "structured_card";
  description: string;
  example: string;
}

// ============================================
// Agent 5: AI UX Specialist 产出
// ============================================
export interface AIUXSpecialistOutput {
  agentName: "AIUXSpecialist";
  expectationManagement: ExpectationDesign;
  transparencyDesign: TransparencyDesign;
  userControlDesign: UserControlDesign;
  gracefulDegradation: GracefulDegradationDesign;
  trustCalibration: TrustCalibrationDesign;
  progressiveDisclosure: ProgressiveDisclosureDesign;
  feedbackLoop: FeedbackLoopDesign;
  fairnessEthics: FairnessEthicsDesign;
}

export interface ExpectationDesign {
  framework: "PAIR" | "HAX";
  principle: string; // "Mental Models / Setting expectations"
  onboarding: string[];
  capabilityIndicators: string[];
  limitationDisclosures: string[];
}

export interface TransparencyDesign {
  framework: "IBM" | "PAIR" | "HAX";
  principle: string; // "Transparency / Explainability"
  reasoningVisibility: string[];
  sourceAttribution: string[];
  confidenceDisplay: string[];
}

export interface UserControlDesign {
  framework: "HAX" | "Apple";
  principle: string; // "User control / Correction"
  undoMechanisms: string[];
  correctionFlows: string[];
  humanTakeoverPoints: string[];
  interruptibility: string[];
}

export interface GracefulDegradationDesign {
  framework: "HAX" | "PAIR";
  principle: string; // "Errors / Graceful failure"
  errorScenarios: ErrorScenario[];
  fallbackUI: string[];
  recoveryPaths: string[];
}

export interface ErrorScenario {
  type: "timeout" | "hallucination" | "refusal" | "partial_result" | "network";
  detection: string;
  userFacingMessage: string;
  recoveryAction: string;
}

export interface TrustCalibrationDesign {
  framework: "PAIR" | "NNg";
  principle: string; // "Trust calibration"
  confidenceLevels: ConfidenceLevel[];
  trustIndicators: string[];
  overTrustPrevention: string[];
  underTrustPrevention: string[];
}

export interface ConfidenceLevel {
  level: "high" | "medium" | "low";
  visualIndicator: string;
  userGuidance: string;
}

export interface ProgressiveDisclosureDesign {
  framework: "Apple";
  principle: string; // "Implicit intelligence"
  layers: DisclosureLayer[];
}

export interface DisclosureLayer {
  level: "basic" | "intermediate" | "advanced";
  features: string[];
  triggerCondition: string;
}

export interface FeedbackLoopDesign {
  framework: "HAX";
  principle: string; // "Encourage granular feedback"
  feedbackMechanisms: string[];
  learningSignals: string[];
  preferenceSetting: string[];
}

export interface FairnessEthicsDesign {
  framework: "IBM" | "PAIR";
  principle: string; // "Fairness / Bias"
  biasChecks: string[];
  inclusiveLanguage: string[];
  privacyProtections: string[];
}

// ============================================
// Agent 6: Interaction Designer 产出
// ============================================
export interface InteractionDesignOutput {
  agentName: "InteractionDesigner";
  pageLayouts: PageLayout[];
  interactionFlows: InteractionFlow[];
  stateDesigns: StateDesign[];
  componentSpecs: ComponentSpec[];
  motionSpecs: MotionSpec[];
  responsiveStrategy: ResponsiveStrategy;
}

export interface PageLayout {
  pageId: string;
  pageName: string;
  description: string;
  regions: LayoutRegion[];
  wireframeDescription: string;
}

export interface LayoutRegion {
  name: string;
  position: "header" | "sidebar" | "main" | "footer" | "modal" | "drawer" | "toast";
  components: string[];
  behavior: string;
}

export interface InteractionFlow {
  id: string;
  name: string;
  steps: FlowStep[];
}

export interface FlowStep {
  pageId: string;
  action: string;
  result: string;
  nextPageId?: string;
  animation?: string;
}

export interface StateDesign {
  pageId: string;
  states: PageState[];
}

export interface PageState {
  name: "empty" | "loading" | "loaded" | "error" | "ai_generating" | "ai_streaming" | "partial" | "success";
  description: string;
  components: string[];
  transitions: string[];
}

export interface ComponentSpec {
  name: string;
  pencilComponent?: string; // Pencil Library 中的组件名
  props: Record<string, string>;
  interactions: string[];
  aiSpecific?: boolean;
}

export interface MotionSpec {
  name: string;
  trigger: string;
  type: "transition" | "micro_interaction" | "ai_streaming" | "loading" | "feedback";
  duration: string;
  easing: string;
  description: string;
}

export interface ResponsiveStrategy {
  breakpoints: Breakpoint[];
  adaptations: ResponsiveAdaptation[];
}

export interface Breakpoint {
  name: string;
  minWidth: number;
  columns: number;
}

export interface ResponsiveAdaptation {
  component: string;
  desktop: string;
  tablet: string;
  mobile: string;
}

// ============================================
// Agent 7: UI Designer 产出
// ============================================
export interface UIDesignOutput {
  agentName: "UIDesigner";
  designSystem: DesignSystemRef;
  pages: UIPage[];
  pencilCommands: PencilCommand[];
}

export interface DesignSystemRef {
  libraryName: string;
  colorTokens: Record<string, string>;
  typographyScale: Record<string, string>;
  spacingScale: Record<string, string>;
}

export interface UIPage {
  pageId: string;
  pageName: string;
  states: UIPageState[];
}

export interface UIPageState {
  stateName: string;
  description: string;
  pencilFrameId?: string; // Pencil 中的 frame ID
}

export interface PencilCommand {
  action: string;
  params: Record<string, unknown>;
  description: string;
}

// ============================================
// Agent 8: Design Reviewer 产出
// ============================================
export interface DesignReviewOutput {
  agentName: "DesignReviewer";
  usabilityReview: UsabilityReviewItem[];
  aiExperienceReview: AIExperienceReviewItem[];
  overallScore: ReviewScore;
  approved: boolean;
  iterationRequired: IterationItem[];
}

export interface UsabilityReviewItem {
  principle: string; // Nielsen's principle
  status: "pass" | "warning" | "fail";
  pageId: string;
  finding: string;
  recommendation: string;
  severity: "critical" | "major" | "minor" | "suggestion";
}

export interface AIExperienceReviewItem {
  framework: "PAIR" | "HAX" | "IBM" | "Apple" | "NNg";
  principle: string;
  status: "pass" | "warning" | "fail";
  pageId: string;
  finding: string;
  recommendation: string;
  severity: "critical" | "major" | "minor" | "suggestion";
}

export interface ReviewScore {
  usability: number; // 1-100
  aiExperience: number; // 1-100
  overall: number; // 1-100
}

export interface IterationItem {
  targetAgent: string;
  issue: string;
  action: string;
  priority: "critical" | "major" | "minor";
}

// ============================================
// 编排器类型
// ============================================
export interface OrchestratorPlan {
  phases: Phase[];
  totalEstimatedTime: string;
}

export interface Phase {
  id: number;
  name: string;
  agents: string[];
  parallel: boolean;
  dependsOn: number[];
  description: string;
}

export interface AgentResult<T = unknown> {
  agentName: string;
  success: boolean;
  output?: T;
  error?: string;
  duration: number;
}

// ============================================
// Pipeline 完整产出
// ============================================
export interface DesignPipelineOutput {
  requirement: ProductRequirement;
  productAnalysis: ProductAnalysisOutput;
  uxResearch: UXResearchOutput;
  infoArchitecture: InfoArchitectureOutput;
  conversationDesign: ConversationDesignOutput;
  aiuxDesign: AIUXSpecialistOutput;
  interactionDesign: InteractionDesignOutput;
  uiDesign: UIDesignOutput;
  designReview: DesignReviewOutput;
}
