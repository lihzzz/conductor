# Conductor 项目优化分析报告

> 基于 2026-03-28 的项目状态与同类应用对比分析

---

## 1. 项目现状概览

### 1.1 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 桌面框架 | Electron | 36.9.5 |
| 前端 | React + TypeScript | 18.3.1 / 5.8.3 |
| 构建工具 | Vite | 6.3.5 |
| 终端渲染 | xterm.js + WebGL | 6.0.0 |
| 进程管理 | node-pty | 1.0.0 |
| 数据存储 | better-sqlite3 (WAL) | 11.8.1 |
| 校验 | zod | 3.24.2 |

### 1.2 代码规模

| 模块 | 文件数 | 代码行数 |
|------|--------|----------|
| Main Process | 12 | ~900 |
| Renderer | 8 | ~850 |
| **总计** | 20 | **~1,761** |

### 1.3 已实现功能

| 功能 | 状态 | 完成度 |
|------|------|--------|
| 团队创建 (lead + dev) | ✅ | 100% |
| Agent 进程启动/停止 | ✅ | 100% |
| 多终端实时输出 | ✅ | 100% |
| Direct/Broadcast 消息 | ✅ | 100% |
| SQLite 数据持久化 | ✅ | 100% |
| IPC 通信层 | ✅ | 100% |
| **自动任务拆解** | ❌ | 0% |
| **任务调度器** | ❌ | 0% |
| **任务依赖管理** | ❌ | 0% |
| **Plan Approval** | ❌ | 0% |

---

## 2. 同类应用对比分析

### 2.1 主要竞品矩阵

| 项目 | 类型 | 多 Agent | 任务拆解 | 终端集成 | 定位差异 |
|------|------|----------|----------|----------|----------|
| **Cline** | VSCode Extension | ❌ 单 Agent | ✅ 自动 | ✅ 集成 | IDE 内单会话，human-in-loop |
| **Roo Code** | VSCode Extension | ✅ Modes | ✅ 自动 | ✅ 集成 | 多角色模式（Code/Architect/Debug） |
| **Claude Code Agent Teams** | CLI Tool | ✅ 多 Agent | ✅ 自动 | ✅ 分屏 | **直接对标**，单机多终端 |
| **Sweep** | JetBrains Plugin | ❌ 单 Agent | ✅ 自动 | ❌ 无 | IDE 集成，专注代码修复 |
| **OpenAgents Autopilot** | Desktop App | ✅ 多 Agent | ✅ 经济驱动 | ✅ 集成 | 市场驱动 + 比特币激励 |
| **Anthropic Autonomous Coding** | SDK Demo | ✅ Two-Agent | ✅ Git 持久 | ❌ 无 | 两阶段模式（initializer + coder） |

### 2.2 Claude Code Agent Teams 机制（直接对标）

| 特性 | Claude Code 实现 | Conductor 现状 | Gap |
|------|------------------|----------------|-----|
| Team Lead + Teammates | ✅ 动态生成 | ⚠️ 固定 2 Agent | 需支持动态 N Agent |
| 共享任务列表 | ✅ `~/.claude/tasks/` | ❌ 无 | **核心缺失** |
| 任务依赖解析 | ✅ DAG + 文件锁 | ❌ 无 | **核心缺失** |
| Mailbox 消息路由 | ✅ Agent 间直发 | ✅ 已实现 | 已完成 |
| 显示模式切换 | ✅ Split Panes / In-process | ⚠️ 仅分屏 | 可优化 |
| Plan Approval | ✅ 用户审批 | ❌ 无 | 需实现 |
| Hook 系统 | ✅ TaskCompleted 等 | ❌ 无 | 可扩展 |
| 会话恢复 | ⚠️ 部分支持 | ❌ 无 | 需实现 |

### 2.3 Roo Code 的创新点（可借鉴）

| 特性 | Roo Code 实现 | Conductor 可借鉴 |
|------|---------------|------------------|
| **Modes 系统** | Code/Architect/Debug/Ask/Custom | 角色切换 UI + 自定义角色模板 |
| **Context Management** | 智能上下文压缩 | 需实现上下文共享机制 |
| **Checkpoints** | 任务进度快照 | Git + 状态快照恢复 |
| **Codebase Indexing** | AST + 语义索引 | 可集成代码索引服务 |
| **Skills as Commands** | /slash 快捷触发 | 可定义团队级 Skill |
| **多语言支持** | 14 种语言 | 国际化 UI |

---

## 3. 优化方向建议

### 3.1 🔴 高优先级（核心功能缺失）

#### 3.1.1 自动任务拆解 (PlannerService)

**现状**：DESIGN.md 中已设计但未实现

**建议实现**：
```typescript
// services/planner/PlannerService.ts
interface TaskPlan {
  goal: string;
  difficulty: 'simple' | 'medium' | 'complex';
  tasks: TaskNode[];
}

class PlannerService {
  async analyzeDifficulty(goal: string, workspace: string): Promise<DifficultyLevel> {
    // 1. 统计文件数 / 模块数
    // 2. 检测跨层依赖（前端/后端/测试）
    // 3. 评估风险级别
    // 4. 返回 difficulty 分数
  }
  
  async decompose(goal: string, difficulty: DifficultyLevel): Promise<TaskPlan> {
    // simple: 1-3 任务
    // medium: 4-6 任务（分析→实现→测试→review→修复）
    // complex: 7-10 任务（模块并行 + 汇总集成）
  }
}
```

**参考**：Claude Code Agent Teams 的任务拆解逻辑

#### 3.1.2 任务调度器 (SchedulerService)

**现状**：完全缺失

**建议实现**：
```typescript
// services/scheduler/SchedulerService.ts
class SchedulerService {
  private taskQueue: PriorityQueue<TaskNode>;
  private agentPool: AgentPool;
  
  async scheduleNext(): Promise<Assignment> {
    // 1. 挑选无依赖且高优先级任务
    // 2. 匹配角色（research→researcher, dev→developer）
    // 3. 分派给空闲 Agent
    // 4. 处理任务状态流转
  }
  
  async handleTaskCompletion(taskId: string, result: TaskResult): void {
    // 1. 更新任务状态
    // 2. 解除下游依赖
    // 3. 触发下一个调度周期
  }
}
```

#### 3.1.3 任务依赖管理 (TaskDependencyService)

**现状**：数据库有 `task_dependencies` 表，但无服务层实现

**建议实现**：
```typescript
// services/task/TaskDependencyService.ts
class TaskDependencyService {
  async canExecute(taskId: string): Promise<boolean> {
    // 检查所有上游依赖是否已完成
  }
  
  async resolveDependencies(taskId: string): Promise<string[]> {
    // 返回阻塞该任务的依赖列表
  }
  
  async unlockDependents(taskId: string): Promise<void> {
    // 任务完成后解除下游阻塞
  }
}
```

---

### 3.2 🟡 中优先级（功能增强）

#### 3.2.1 动态 Agent 数量

**现状**：固定 2 Agent (lead + dev)

**优化**：
- 支持 3-8 Agent 动态配置
- 角色模板：lead, researcher, developer, reviewer, tester
- 用户可自定义角色名称和职责

```typescript
// TeamService.ts 扩展
createTeam(input: {
  name: string;
  workspaceRoot: string;
  agentConfig: Array<{ role: AgentRole; name?: string }>;
}): TeamResult;
```

#### 3.2.2 Plan Approval 机制

**现状**：无审批流程

**建议**：
- 任务拆解后展示 Plan Summary
- 用户可 Accept / Modify / Reject
- 支持单个任务调整（优先级、分配、依赖）

```typescript
interface PlanApproval {
  planId: string;
  status: 'pending' | 'approved' | 'modified' | 'rejected';
  modifications?: PlanModification[];
}
```

#### 3.2.3 Hook 系统

**现状**：无

**建议**：
- `TaskCompleted` Hook：任务完成触发
- `TeammateIdle` Hook：Agent 空闲通知
- `TaskFailed` Hook：失败重试/降级
- 支持自定义 Hook Handler

```typescript
// services/hooks/HookManager.ts
type HookType = 'task_completed' | 'agent_idle' | 'task_failed' | 'plan_approved';

interface HookHandler {
  hook: HookType;
  handler: (context: HookContext) => Promise<void>;
}
```

#### 3.2.4 会话恢复

**现状**：无

**建议**：
- Agent 进程退出后可重启
- 任务状态持久化（SQLite 已有）
- 终端输出历史保存（可加载）

---

### 3.3 🟢 低优先级（锦上添花）

#### 3.3.1 多模型支持

**现状**：仅 Claude Code CLI

**优化**：
- 支持 Codex CLI、Cursor CLI、Gemini CLI
- Agent 配置中指定模型
- 模型切换 UI

#### 3.3.2 代码索引集成

**现状**：无

**参考**：Roo Code 的 AST + 语义索引

**建议**：
- 集成 `tree-sitter` 解析 AST
- 可选：集成 `meilisearch` 建立语义索引
- Agent 可快速定位相关代码

#### 3.3.3 国际化 UI

**现状**：仅英文

**参考**：Roo Code 的 14 语言支持

#### 3.3.4 状态可视化

**现状**：基础 UI

**优化**：
- 任务 DAG 流程图（类似 AgentCrew 的 PipelineFlowchartView）
- Agent 状态灯（idle/busy/offline）
- 实时进度条

#### 3.3.5 跨机器协同

**现状**：单机

**未来**：
- 支持 SSH 远程 Agent
- 分布式任务队列
- 需要网络层重构

---

## 4. 实现路线建议

### Phase 1（2 周）- 核心闭环

| 任务 | 预估时间 | 依赖 |
|------|----------|------|
| PlannerService 实现 | 3 天 | 无 |
| SchedulerService 实现 | 2 天 | Planner |
| TaskDependencyService | 2 天 | 无 |
| Plan Approval UI | 2 天 | Planner |
| 动态 Agent 配置 | 1 天 | 无 |
| **总计** | **10 天** | |

### Phase 2（1 周）- 功能增强

| 任务 | 预估时间 |
|------|----------|
| Hook 系统 | 2 天 |
| 会话恢复 | 2 天 |
| 任务 DAG 可视化 | 2 天 |
| **总计** | **6 天** |

### Phase 3（持续）- 扩展能力

- 多模型支持
- 代码索引集成
- 国际化
- 跨机器协同

---

## 5. 与 Claude Code Agent Teams 的差异化定位

| 维度 | Claude Code Agent Teams | Conductor 优势方向 |
|------|------------------------|-------------------|
| **平台** | CLI + 终端分屏 | **独立桌面 App**，UI 更丰富 |
| **持久化** | 仅任务列表 | **SQLite 全量持久化**，可恢复 |
| **审批流** | 基础 Plan Approval | **可视化 Plan 编辑**，更精细 |
| **Agent 配置** | 固定角色 | **自定义角色模板** |
| **监控** | 终端输出 | **实时 DAG 流程图 + 事件日志** |
| **扩展** | CLI 限定 | **可集成多 CLI 工具** |

---

## 6. 参考资源

- [Claude Code Agent Teams 文档](https://code.claude.com/docs/agent-teams)（概念参考）
- [Roo Code 源码](https://github.com/RooCodeInc/Roo-Code)（Modes 系统参考）
- [Cline 源码](https://github.com/cline/cline)（human-in-loop 参考）
- [Anthropic Autonomous Coding](https://github.com/anthropics/claude-quickstarts/tree/main/autonomous-coding)（两阶段模式参考）

---

**版本**：v1.0  
**日期**：2026-03-28  
**作者**：lalalala (OpenClaw Agent)