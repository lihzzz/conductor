# GitHub 同类应用搜索结果

> 搜索日期：2026-03-28

---

## 🔥 核心发现

**已存在大量同类型项目！** 最热门的 `oh-my-claudecode` 已有 **14,434 stars**，是直接对标产品。

---

## 同类应用列表

### 📊 按热度排序

| 排名 | 项目名称 | Stars | 描述 | 语言 | 链接 |
|------|----------|-------|------|------|------|
| 1 | **oh-my-claudecode** | 14,434 | Teams-first Multi-agent orchestration for Claude Code | TypeScript | https://github.com/Yeachan-Heo/oh-my-claudecode |
| 2 | **awesome-agent-skills** | 13,156 | Claude Code Skills + 1000+ agent skills | TypeScript | https://github.com/VoltAgent/awesome-agent-skills |
| 3 | **awesome-claude-agents** | 4,102 | An orchestrated sub agent dev team powered by claude code | - | https://github.com/vijaythecoder/awesome-claude-agents |
| 4 | **Claude-Code-Workflow** | 1,608 | JSON-driven multi-agent cadence-team framework | TypeScript | https://github.com/catlog22/Claude-Code-Workflow |
| 5 | **agent-teams-lite** | 1,078 | Spec-Driven Development with AI Sub-Agents (orchestrator + 9 agents) | Shell | https://github.com/Gentleman-Programming/agent-teams-lite |
| 6 | **clawport-ui** | 767 | Open-source AI agent command center for Claude Code agent teams. **Built on OpenClaw** | TypeScript | https://github.com/JohnRiceML/clawport-ui |
| 7 | **claude_agent_teams_ui** | 194 | Kanban board for agent teams - "You're the CTO, drink coffee" | TypeScript | https://github.com/777genius/claude_agent_teams_ui |
| 8 | **claude-code-teams-mcp** | 227 | Use claude code's agent teams orchestration with any harness | - | https://github.com/cs50victor/claude-code-teams-mcp |
| 9 | **Claude-Agent-Team-Manager** | 111 | Visual org-chart desktop app for managing Claude Code agent teams | TypeScript | https://github.com/DatafyingTech/Claude-Agent-Team-Manager |
| 10 | **ai-sales-team-claude** | 168 | AI-powered sales team (14 skills, 5 parallel agents) | - | https://github.com/zubair-trabzada/ai-sales-team-claude |
| 11 | **claude-code-tool-manager** | 269 | GUI app to manage MCP servers for Claude Code | Rust | https://github.com/tylergraydev/claude-code-tool-manager |

---

### 🖥️ Desktop App 类（与 Conductor 直接对标）

| 项目 | Stars | 特点 | 技术栈 | 链接 |
|------|-------|------|--------|------|
| **clawport-ui** | 767 | 基于 **OpenClaw** 构建，命令中心 | TypeScript | https://github.com/JohnRiceML/clawport-ui |
| **Claude-Agent-Team-Manager** | 111 | 组织结构图 + 可视化管理 | TypeScript | https://github.com/DatafyingTech/Claude-Agent-Team-Manager |
| **claude_agent_teams_ui** | 194 | Kanban 风格，CTO 视角 | TypeScript | https://github.com/777genius/claude_agent_teams_ui |
| **klawd-nexus** | 0 | 多终端管理 + MCP + 远程手机访问 | JavaScript | https://github.com/chriscode138/klawd-nexus |
| **AgentRune** | 2 | 桌面+移动端，skill chains + 共享内存 | TypeScript | https://github.com/Kujirafu/AgentRune |
| **InsightForge** | 0 | 多 Agent 研究编排 + Electron | - | https://github.com/EricCacciavillani/InsightForge |
| **agent-review-room** | 4 | 多 Provider AI reviewer + 会议综合 | - | https://github.com/eitamring/agent-review-room |
| **ralph-loop-iterator** | 0 | Electron 多终端 + PTY sessions | - | https://github.com/zenith-projects/ralph-loop-iterator-releases |

---

### 🔌 Plugin/CLI 类

| 项目 | Stars | 特点 | 链接 |
|------|-------|------|------|
| **oh-my-claudecode** | 14,434 | Claude Code Plugin，Team Mode + tmux workers | https://github.com/Yeachan-Heo/oh-my-claudecode |
| **Claude-Code-Workflow** | 1,608 | JSON-driven，多 CLI 支持（Gemini/Qwen/Codex） | https://github.com/catlog22/Claude-Code-Workflow |
| **agent-teams-lite** | 1,078 | 纯 Markdown，零依赖，9 个专业子 Agent | https://github.com/Gentleman-Programming/agent-teams-lite |
| **claude-code-teams-mcp** | 227 | MCP 协议适配任何 harness | https://github.com/cs50victor/claude-code-teams-mcp |
| **claude-code-tool-manager** | 269 | Rust GUI，MCP Server 管理 | https://github.com/tylergraydev/claude-code-tool-manager |

---

### 📚 Resource/Skills 类

| 项目 | Stars | 特点 | 链接 |
|------|-------|------|------|
| **awesome-agent-skills** | 13,156 | 1000+ agent skills，多 CLI 兼容 | https://github.com/VoltAgent/awesome-agent-skills |
| **awesome-claude-agents** | 4,102 | Claude Code sub-agent dev team | https://github.com/vijaythecoder/awesome-claude-agents |

---

## 重点项目分析

### 🏆 oh-my-claudecode（14,434 stars）

**核心定位**：Teams-first Multi-agent orchestration for Claude Code

**关键特性**：
- ✅ **Team Mode**（v4.1.7+）：`team-plan → team-prd → team-exec → team-verify → team-fix`
- ✅ tmux CLI Workers（Codex & Gemini 支持）
- ✅ Deep Interview（苏格拉底式需求澄清）
- ✅ 插件形式集成到 Claude Code
- ✅ 多语言文档（中/日/韩/西班牙语等）

**与 Conductor 的差异**：
| 维度 | oh-my-claudecode | Conductor |
|------|------------------|-----------|
| 形态 | Claude Code Plugin | **独立 Electron App** |
| Team Mode | ✅ 内置 | ❌ 需实现 |
| UI | CLI + tmux | **独立桌面 UI** |
| 持久化 | 轻量 | **SQLite 全量** |
| 跨 CLI | ✅ Codex/Gemini | 仅 Claude Code |

---

### 🦀 clawport-ui（767 stars）

**核心定位**：Open-source AI agent command center for Claude Code agent teams. **Built on OpenClaw**

**关键点**：
- 🔴 **基于 OpenClaw 构建！** 与你的基础设施相同
- 命令中心形态
- TypeScript 实现

**建议**：深入研究此项目，可能与 Conductor 互补或可复用组件。

---

### 📋 Claude-Agent-Team-Manager（111 stars）

**核心定位**：Visual org-chart desktop app for managing Claude Code agent teams

**关键特性**：
- 组织结构图可视化
- Skills 配置管理
- Desktop App（TypeScript）

---

### 🎯 claude_agent_teams_ui（194 stars）

**核心定位**：Kanban board for agent teams - "You're the CTO, drink coffee"

**核心卖点**：
- Kanban 风格任务管理
- Agent 自主协作，用户仅看板监控
- CTO 视角的产品定位（营销亮点）

---

## Conductor 的差异化机会

| 差异点 | 现有竞品 | Conductor 机会 |
|--------|----------|----------------|
| **独立 App** | 多为 Plugin/CLI | 唯 clawport-ui，可深耕 |
| **SQLite 全量持久化** | 轻量存储 | 竞品缺少完整持久化方案 |
| **多终端实时渲染** | tmux split | Electron + xterm.js 更流畅 |
| **Plan Approval UI** | CLI 交互 | 可视化编辑更友好 |
| **任务 DAG 可视化** | 仅 Kanban | 流程图 + 状态灯 |
| **跨 CLI 支持** | oh-my-claudecode 已实现 | 需跟进 Codex/Gemini |

---

## 建议下一步

1. **深入研究 oh-my-claudecode** - 学习 Team Mode 流程设计
2. **分析 clawport-ui** - OpenClaw 同生态，可复用
3. **参考 claude_agent_teams_ui** - Kanban + CTO 视角定位
4. **差异化方向**：独立 App + SQLite 持久化 + DAG 可视化

---

**版本**：v1.0  
**日期**：2026-03-28