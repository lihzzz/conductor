# Conductor

Electron + React + TypeScript 桌面应用，用于本地多 Agent 协作（基于 Claude Code）。

## 功能

- 创建 Team 并初始化多个 Agent（1 lead + N teammates）
- 通过 xterm.js 终端与每个 Agent 交互
- Agent 间消息通信（Direct / Broadcast）
- Events 日志记录

## 本地运行

```bash
npm install
npm run build
npm start
```

开发模式：

```bash
npm run dev
```

## 使用流程

1. 输入 workspace 路径
2. 点击 "Create Team" 创建团队
3. 点击 "Start All" 启动所有 Agent
4. 在 Agent 终端中输入任务
5. Agent 间可通过消息面板通信
6. 点击 "Stop All" 停止所有 Agent

## 目录结构

- `apps/desktop/main`: Electron 主进程、IPC、运行时
- `apps/desktop/renderer`: React UI + xterm.js 终端
- `apps/desktop/main/db/schema.sql`: SQLite schema

## 说明

- 数据库默认位于 `~/.conductor/conductor.db`
- Agent 运行时通过 `node-pty` 启动 `claude` 命令，确保本机可执行 `claude`