# Mira Design Agent Team

这是一个 9-Agent 设计团队，从产品需求到高保真 UI 设计的完整流水线。
专门服务于 Mira AI Agent 编排平台。

## 快速开始

### 创建新需求
```bash
./new-requirement.sh agent-workflow-builder
```

### 运行 Agent Team
```
/agent mira-design-team

需求：请阅读 requirements/20260401-agent-workflow-builder/requirement.json
```

## 项目结构

```
Mira Design Agent Team/
├── .claude/agents/
│   └── mira-design-team.md    ← Agent Team 定义（9 个角色）
├── requirements/               ← 每个需求一个文件夹
│   ├── .template/              ← 模板
│   ├── 20260401-chat-interface/
│   │   ├── requirement.json    ← 需求输入
│   │   ├── README.md           ← 进度追踪
│   │   └── output/             ← Agent 产出物（自动生成）
│   └── 20260402-dashboard/
│       └── ...
├── src/                        ← Agent Team 代码（API 版本）
├── examples/                   ← 示例需求
├── CLAUDE.md                   ← 本文件（项目记忆）
└── new-requirement.sh          ← 创建新需求的快捷脚本
```

## Agent 团队

| Agent | 职责 |
|-------|------|
| Product Analyst | 需求拆解 (INVEST/MoSCoW/JTBD) |
| UX Researcher | 用户研究 (Nielsen/Norman/Cooper) |
| Info Architect | 信息架构 (Rosenfeld/LATCH) |
| Conversation Designer | 对话设计 (Grice/Google) |
| AI UX Specialist | AI 体验设计 (PAIR/HAX/Apple/IBM/NNg) |
| Interaction Designer | 交互设计 (Fitts/Hick/Gestalt) |
| UI Designer | Pencil MCP 绘制高保真 UI |
| Design Reviewer | 双维度审查 (Nielsen + AI UX) |
| Orchestrator | 编排全部角色 |

## 依赖

- Pencil Desktop 应用（用于 MCP 绘图）
- Claude Code（用于运行 Agent）
