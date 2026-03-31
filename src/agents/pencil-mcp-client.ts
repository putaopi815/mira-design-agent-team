/**
 * Pencil MCP Client
 *
 * Pencil MCP server 内置在 Pencil Desktop 应用中，提供以下工具：
 *
 * 读取工具：
 *   - get_editor_state: 获取当前 .pen 文件路径、选中元素、顶层节点、可复用组件列表
 *   - batch_get: 按 ID 读取特定节点
 *   - search-design-nodes: 搜索/读取节点
 *   - snapshot_layout: 获取子树的布局快照
 *   - get_variables: 读取所有设计令牌/变量
 *   - get_screenshot: 对节点截图验证
 *   - get_guidelines: 获取指定指南文档 (webapp, mobile-app, landing-page, design-system, slides)
 *   - get_style_guide: 获取样式指南
 *   - get_style_guide_tags: 列出可用样式指南标签
 *
 * 设计工具 (batch_design 内部命令，每次最多 25 个操作):
 *   - I(parentId, props): 插入新节点
 *   - R(targetPath, props): 替换节点
 *   - U(targetPath, props): 更新节点属性
 *   - C(sourceId, targetParentId, overrides): 复制节点
 *   - D(nodeId): 删除节点
 *   - G(frameId, type, description): 生成 AI/Stock 图片
 *   - M(nodeId, targetParentId, index): 移动节点
 *
 * 节点类型: frame, text, ref (组件实例), icon_font, group, rectangle, ellipse, line, path, note
 *
 * 组件系统:
 *   - ref: 引用可复用组件 ID
 *   - slot: 组件内的占位符，可插入子组件
 *   - descendants: 覆盖组件实例内嵌套节点的属性
 *   - 路径语法: instanceBinding + "/childId"
 */

// ============================================
// Pencil MCP 命令类型定义
// ============================================

export interface PencilInsertCommand {
  operation: "I";
  parentId: string;
  props: PencilNodeProps;
  binding?: string; // 变量名，用于后续引用
}

export interface PencilUpdateCommand {
  operation: "U";
  targetPath: string;
  props: Record<string, unknown>;
}

export interface PencilReplaceCommand {
  operation: "R";
  targetPath: string;
  props: PencilNodeProps;
  binding?: string;
}

export interface PencilCopyCommand {
  operation: "C";
  sourceId: string;
  targetParentId: string;
  overrides?: Record<string, unknown>;
  binding?: string;
}

export interface PencilDeleteCommand {
  operation: "D";
  nodeId: string;
}

export interface PencilGenerateImageCommand {
  operation: "G";
  frameId: string;
  imageType: "ai" | "stock";
  description: string;
}

export interface PencilMoveCommand {
  operation: "M";
  nodeId: string;
  targetParentId: string;
  index: number;
}

export type PencilCommand =
  | PencilInsertCommand
  | PencilUpdateCommand
  | PencilReplaceCommand
  | PencilCopyCommand
  | PencilDeleteCommand
  | PencilGenerateImageCommand
  | PencilMoveCommand;

export interface PencilNodeProps {
  type: "frame" | "text" | "ref" | "icon_font" | "group" | "rectangle" | "ellipse";
  name?: string;
  // Layout
  layout?: "none" | "vertical" | "horizontal";
  gap?: number | string;
  padding?: number | number[] | string;
  justifyContent?: "start" | "center" | "end" | "space_between" | "space_around";
  alignItems?: "start" | "center" | "end";
  // Size
  width?: number | string;
  height?: number | string;
  // Visual
  fill?: string;
  stroke?: Record<string, unknown>;
  cornerRadius?: number | string;
  opacity?: number;
  placeholder?: boolean;
  // Text
  content?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  // Ref (component instance)
  ref?: string;
  descendants?: Record<string, Record<string, unknown>>;
  // Icon
  iconFontFamily?: string;
  iconFontName?: string;
  // Children (for inline creation)
  children?: PencilNodeProps[];
  // Slot
  slot?: string[];
  enabled?: boolean;
}

// ============================================
// Script Generator: 将结构化命令转为 Pencil batch_design 脚本
// ============================================

/**
 * 将结构化的 PencilCommand 数组转换为 Pencil batch_design 脚本字符串
 */
export function generateBatchDesignScript(commands: PencilCommand[]): string {
  return commands.map(commandToScript).join("\n");
}

function commandToScript(cmd: PencilCommand): string {
  switch (cmd.operation) {
    case "I": {
      const binding = cmd.binding ? `${cmd.binding}=` : "";
      return `${binding}I(${cmd.parentId}, ${JSON.stringify(cmd.props)})`;
    }
    case "U":
      return `U(${cmd.targetPath}, ${JSON.stringify(cmd.props)})`;
    case "R": {
      const binding = cmd.binding ? `${cmd.binding}=` : "";
      return `${binding}R(${cmd.targetPath}, ${JSON.stringify(cmd.props)})`;
    }
    case "C": {
      const binding = cmd.binding ? `${cmd.binding}=` : "";
      const overrides = cmd.overrides ? `, ${JSON.stringify(cmd.overrides)}` : "";
      return `${binding}C(${cmd.sourceId}, ${cmd.targetParentId}${overrides})`;
    }
    case "D":
      return `D(${cmd.nodeId})`;
    case "G":
      return `G(${cmd.frameId}, "${cmd.imageType}", "${cmd.description}")`;
    case "M":
      return `M(${cmd.nodeId}, ${cmd.targetParentId}, ${cmd.index})`;
  }
}

/**
 * 将 batch_design 脚本按 25 个操作一组分批
 * Pencil MCP 限制每次 batch_design 最多 25 个操作
 */
export function splitIntoBatches(commands: PencilCommand[], batchSize = 25): PencilCommand[][] {
  const batches: PencilCommand[][] = [];
  for (let i = 0; i < commands.length; i += batchSize) {
    batches.push(commands.slice(i, i + batchSize));
  }
  return batches;
}

// ============================================
// 设计令牌常量 (Pencil Design Tokens)
// ============================================

export const DESIGN_TOKENS = {
  // Colors
  colors: {
    background: "$--background",
    foreground: "$--foreground",
    mutedForeground: "$--muted-foreground",
    card: "$--card",
    border: "$--border",
    primary: "$--primary",
    secondary: "$--secondary",
    destructive: "$--destructive",
  },
  // Typography
  fonts: {
    primary: "$--font-primary",
    secondary: "$--font-secondary",
  },
  // Border Radius
  radius: {
    none: "$--radius-none",
    medium: "$--radius-m",
    pill: "$--radius-pill",
  },
  // Spacing reference
  spacing: {
    screenSections: 24,
    cardGrid: 16,
    formFields: 16,
    buttonGroups: 12,
    insideCards: 24,
    insideButtons: [10, 16] as number[],
    insideInputs: [8, 16] as number[],
    pageContent: 32,
  },
} as const;

// ============================================
// 屏幕布局模板
// ============================================

export const LAYOUT_TEMPLATES = {
  /** Pattern A: Sidebar + Content (Dashboard) */
  sidebarContent: (width = 1440, height = 900): PencilCommand[] => [
    {
      operation: "I",
      parentId: "document",
      binding: "screen",
      props: {
        type: "frame",
        name: "Dashboard",
        layout: "horizontal",
        width,
        height: `fit_content(${height})`,
        fill: "$--background",
        placeholder: true,
      },
    },
  ],

  /** Pattern B: Header + Content */
  headerContent: (width = 1200, height = 800): PencilCommand[] => [
    {
      operation: "I",
      parentId: "document",
      binding: "screen",
      props: {
        type: "frame",
        name: "Page",
        layout: "vertical",
        width,
        height: `fit_content(${height})`,
        fill: "$--background",
        placeholder: true,
      },
    },
  ],
} as const;

// ============================================
// Component Helper: 常用组件创建快捷方式
// ============================================

export const ComponentHelper = {
  /** 创建文本节点 */
  text(
    parentBinding: string,
    content: string,
    options: {
      fontSize?: number;
      fontWeight?: string;
      fill?: string;
      fontFamily?: string;
    } = {}
  ): PencilInsertCommand {
    return {
      operation: "I",
      parentId: parentBinding,
      props: {
        type: "text",
        content,
        fontSize: options.fontSize || 14,
        fontWeight: options.fontWeight || "400",
        fill: options.fill || DESIGN_TOKENS.colors.foreground,
        fontFamily: options.fontFamily || DESIGN_TOKENS.fonts.secondary,
      },
    };
  },

  /** 创建图标 */
  icon(
    parentBinding: string,
    iconName: string,
    options: {
      family?: string;
      size?: number;
      fill?: string;
    } = {}
  ): PencilInsertCommand {
    return {
      operation: "I",
      parentId: parentBinding,
      props: {
        type: "icon_font",
        iconFontFamily: options.family || "lucide",
        iconFontName: iconName,
        width: options.size || 24,
        height: options.size || 24,
        fill: options.fill || DESIGN_TOKENS.colors.foreground,
      },
    };
  },

  /** 创建容器 frame */
  frame(
    parentBinding: string,
    binding: string,
    options: {
      layout?: "vertical" | "horizontal" | "none";
      width?: number | string;
      height?: number | string;
      gap?: number;
      padding?: number | number[];
      fill?: string;
      name?: string;
    } = {}
  ): PencilInsertCommand {
    return {
      operation: "I",
      parentId: parentBinding,
      binding,
      props: {
        type: "frame",
        name: options.name,
        layout: options.layout || "vertical",
        width: options.width || "fill_container",
        height: options.height || "fit_content",
        gap: options.gap || 0,
        padding: options.padding,
        fill: options.fill,
      },
    };
  },

  /** 插入组件实例 */
  componentRef(
    parentBinding: string,
    componentId: string,
    binding: string,
    options: {
      width?: number | string;
      height?: number | string;
      descendants?: Record<string, Record<string, unknown>>;
    } = {}
  ): PencilInsertCommand {
    return {
      operation: "I",
      parentId: parentBinding,
      binding,
      props: {
        type: "ref",
        ref: componentId,
        width: options.width,
        height: options.height,
        descendants: options.descendants,
      },
    };
  },

  /** 禁用 slot */
  disableSlot(slotPath: string): PencilUpdateCommand {
    return {
      operation: "U",
      targetPath: slotPath,
      props: { enabled: false },
    };
  },
};
