# Conductor 设计方案（MVP v1）

> 面向 macOS 的 Electron 多 Agent 协作工作台（先聚焦 Claude Code）

---

## 1. 目标与边界

### 1.1 MVP 目标

先做可用闭环，不做重型平台能力：

1. 用户输入一个任务目标
2. 系统自动评估任务难度并拆解为子任务
3. 系统将子任务分派给多个 Claude Code Agent 并行执行
4. Agent 之间可以直接通信（点对点 + 广播）
5. 用户在一个页面观察任务状态、消息流、终端输出

### 1.2 本期不做

1. 跨机器协同
2. 多模型供应商（先只支持 Claude Code）
3. 复杂全局重规划（global replan）
4. 企业级权限策略引擎
5. Web 远程控制台

---

## 2. 技术栈

### 2.1 桌面与前端

1. Electron
2. React + TypeScript
3. Vite
4. Zustand（前端状态管理）
5. TanStack Query（数据同步）
6. xterm.js（多终端视图）

### 2.2 主进程与执行层

1. Electron Main Process（控制平面）
2. node-pty（托管 Claude Code 进程）
3. better-sqlite3（本地存储，WAL 模式）
4. zod（IPC 与 Planner 输出校验）

---

## 3. 总体架构

```text
+-------------------------------------------------------------+
|                       Electron App                          |
|                                                             |
|  +-------------------+       +---------------------------+  |
|  |   Renderer (UI)   | <-->  | Main Process (Control)   |  |
|  | - Task Board      | IPC   | - TeamService            |  |
|  | - Message Board   |       | - PlannerService         |  |
|  | - Terminal Panes  |       | - SchedulerService       |  |
|  | - Agent Status    |       | - AgentRuntimeService    |  |
|  +-------------------+       | - MessageRouterService    |  |
|                              +-------------+-------------+  |
|                                            |                |
|                                  +---------v---------+      |
|                                  |      SQLite       |      |
|                                  | teams/tasks/...   |      |
|                                  +-------------------+      |
|                                            |                |
|                                  +---------v---------+      |
|                                  | Claude Code CLI   |      |
|                                  | (multiple PTYs)   |      |
|                                  +-------------------+      |
+-------------------------------------------------------------+
```

---

## 4. 核心模块设计

### 4.1 TeamService

职责：
1. 创建/销毁 Team
2. 创建 Agent（Lead / Teammate）
3. 管理 Team 基础配置（工作目录、agent 数量）

### 4.2 PlannerService（自动任务拆解）

职责：
1. 输入用户目标，产出结构化任务树（Task DAG）
2. 先做难度评估，再做拆解
3. 产物写入 `tasks` 与 `task_dependencies`

接口：
1. `analyzeDifficulty(goal) -> simple | medium | complex`
2. `decompose(goal, difficulty) -> TaskPlan`
3. `validatePlan(plan) -> normalizedPlan`

### 4.3 SchedulerService

职责：
1. 根据依赖关系挑选可执行任务
2. 按角色匹配分派任务（research/dev/review/test）
3. 处理任务状态流转

策略（MVP）：
1. 优先分派无依赖且高优先级任务
2. Agent 空闲时自动认领
3. 失败任务最多重试 1 次，超过则标记 failed

### 4.4 AgentRuntimeService

职责：
1. 启动/停止 Claude Code 进程（node-pty）
2. 发送输入给指定 Agent
3. 流式收集 stdout/stderr 并推送 UI

### 4.5 MessageRouterService

职责：
1. Agent 间 direct 消息
2. broadcast 消息
3. 消息持久化与送达状态维护

---

## 5. 自动任务拆解设计（轻量版）

### 5.1 难度评估维度

每个维度 0-2 分，总分 0-10：

1. 改动范围（涉及文件/模块数量）
2. 跨层复杂度（前端/后端/测试是否联动）
3. 风险级别（重构/删除/迁移）
4. 外部依赖（是否需要调研或第三方集成）
5. 验证复杂度（是否需要多轮验证）

映射规则：
1. 0-3：`simple`
2. 4-7：`medium`
3. 8-10：`complex`

### 5.2 拆解规则

1. simple：1-3 个任务（实现 -> 验证）
2. medium：4-6 个任务（分析 -> 实现 -> 测试 -> review -> 修复）
3. complex：7-10 个任务（按模块并行 + 汇总集成 + 最终验证）

### 5.3 计划输出结构

```json
{
  "goal": "string",
  "difficulty": "simple|medium|complex",
  "tasks": [
    {
      "id": "task-1",
      "title": "Implement X",
      "description": "string",
      "assigneeRole": "research|dev|review|test",
      "priority": 1,
      "dependsOn": [],
      "acceptanceCriteria": ["..."],
      "riskLevel": "low|medium|high"
    }
  ]
}
```

---

## 6. 数据模型（SQLite）

### 6.1 teams

1. `id TEXT PRIMARY KEY`
2. `name TEXT NOT NULL`
3. `workspace_root TEXT NOT NULL`
4. `created_at TEXT NOT NULL`

### 6.2 agents

1. `id TEXT PRIMARY KEY`
2. `team_id TEXT NOT NULL`
3. `name TEXT NOT NULL`
4. `role TEXT NOT NULL` (`lead|research|dev|review|test`)
5. `status TEXT NOT NULL` (`idle|busy|offline`)
6. `pid INTEGER`
7. `created_at TEXT NOT NULL`

### 6.3 tasks

1. `id TEXT PRIMARY KEY`
2. `team_id TEXT NOT NULL`
3. `title TEXT NOT NULL`
4. `description TEXT`
5. `status TEXT NOT NULL` (`pending|claimed|running|completed|failed`)
6. `priority INTEGER NOT NULL DEFAULT 3`
7. `assignee_agent_id TEXT`
8. `risk_level TEXT NOT NULL DEFAULT 'low'`
9. `created_at TEXT NOT NULL`
10. `updated_at TEXT NOT NULL`

### 6.4 task_dependencies

1. `task_id TEXT NOT NULL`
2. `depends_on_task_id TEXT NOT NULL`
3. PRIMARY KEY (`task_id`, `depends_on_task_id`)

### 6.5 messages

1. `id TEXT PRIMARY KEY`
2. `team_id TEXT NOT NULL`
3. `from_agent_id TEXT NOT NULL`
4. `to_agent_id TEXT`（broadcast 时可为空）
5. `type TEXT NOT NULL` (`direct|broadcast`)
6. `content TEXT NOT NULL`
7. `delivery_status TEXT NOT NULL` (`queued|delivered|read`)
8. `created_at TEXT NOT NULL`

### 6.6 events

1. `id TEXT PRIMARY KEY`
2. `team_id TEXT NOT NULL`
3. `event_type TEXT NOT NULL`
4. `payload TEXT NOT NULL`
5. `created_at TEXT NOT NULL`

---

## 7. 状态机

### 7.1 任务状态

1. `pending -> claimed -> running -> completed`
2. `running -> failed`
3. `failed -> running`（重试）

### 7.2 Agent 状态

1. `idle -> busy -> idle`
2. `idle|busy -> offline`（进程退出或异常）

### 7.3 消息状态

1. `queued -> delivered -> read`

---

## 8. UI 设计（单页观察）

### 8.1 左侧

1. Team 列表
2. Agent 列表（状态灯）

### 8.2 中间

1. Task Board（按状态列）
2. 任务依赖关系提示

### 8.3 右侧

1. 消息流（direct / broadcast）
2. Agent 终端 Tabs（xterm.js）
3. 当前执行日志

---

## 9. 非功能性要求

1. 本地优先：无外部服务依赖可运行
2. 稳定性：Agent 崩溃后可手动重启
3. 可观测：关键动作写入 events
4. 性能：支持 3-8 个 Agent 并行运行

---

## 10. 里程碑与任务拆分

### Phase 1（基础骨架，3-4 天）

1. Electron + React + TypeScript 初始化
2. IPC 协议与目录结构
3. SQLite 初始化与 migration

### Phase 2（多 Agent 运行时，4-5 天）

1. node-pty 集成 Claude Code
2. Agent 生命周期管理
3. xterm.js 多终端展示

### Phase 3（自动拆解 + 调度，4-6 天）

1. PlannerService（难度评估 + 拆解）
2. PlanValidator + PlanNormalizer
3. Scheduler 自动分派与状态流转

### Phase 4（通信与监控，3-4 天）

1. MessageRouter（direct/broadcast）
2. 单页监控整合（任务+消息+终端）
3. 基础异常处理与重试

---

## 11. 验收标准（MVP）

1. 用户输入 1 条目标任务，系统可自动生成子任务并入库
2. 至少 3 个 Agent 可并行执行并实时输出
3. Agent 间 direct/broadcast 消息可达并可追踪
4. 用户在单页面可观察任务状态、消息、终端输出
5. 任务完成率、失败任务重试行为符合状态机定义

---

**版本**：v1.0-mvp  
**日期**：2026-03-28  
**适用范围**：Conductor Electron MVP（Claude Code 优先）
