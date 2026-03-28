# Conductor UI 重新设计计划

> 基于 Octrix 设计风格的群组式多 Agent 协作界面

---

## 设计参考来源

**Octrix** (https://octrix.work/)
- macOS 原生深色主题
- 群聊式协作交互
- 底部终端抽屉设计
- 消息气泡 + @提及系统

---

## 当前架构 vs 新架构

### 当前架构（Dashboard 模式）
```
┌─────────────────────────────────────────┐
│  Header (Workspace + Team Controls)     │
├─────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐               │
│  │ Agent 1 │ │ Agent 2 │  ...          │
│  │ Terminal│ │ Terminal│               │
│  └─────────┘ └─────────┘               │
├─────────────────────────────────────────┤
│  Message Panel + Event Log              │
└─────────────────────────────────────────┘
```

### 新架构（群组式导航）
```
┌──────────┬──────────────────────────────┐
│          │  Chat Header (Team Info)     │
│  Team    ├──────────────────────────────┤
│  List    │                              │
│          │  Message Flow (Bubble Style) │
│  💬 Team1│                              │
│  💬 Team2│  ┌─ Agent ─┐                 │
│  💬 Team3│  │ Message │                 │
│          │  └─────────┘                 │
│  [+ New] │                              │
│          │  ┌─────────┐                 │
│          │  │ User Msg│                 │
│          │  └─────────┘                 │
│          │                              │
│          ├──────────────────────────────┤
│          │  Chat Input (@ mention)      │
│          ├──────────────────────────────┤
│          │  ▲ Workspace Terminal        │
│          │  ┌────────────────────────┐  │
│          │  │ $ claude               │  │
│          │  │ > working...           │  │
│          │  └────────────────────────┘  │
└──────────┴──────────────────────────────┘
```

---

## 页面结构

### 1. 群组列表页 (TeamListPage)

**路径**: `/`

**布局**:
```
┌─────────────────────────────────────────┐
│  Conductor                    [+] 新建  │
├─────────────────────────────────────────┤
│  🔍 搜索群组...                         │
├─────────────────────────────────────────┤
│  📁 活跃团队                            │
│  ├─ 💬 支付链路重构        4成员·3在线   │
│  │   最后消息: 2分钟前                   │
│  ├─ 💬 Agent平台落地       3成员·2在线   │
│  └─ 💬 上下文丢失修复      2成员·2在线   │
│                                         │
│  📁 归档团队                            │
│  └─ 💬 旧项目重构          已停止        │
└─────────────────────────────────────────┘
```

**功能**:
- 显示所有团队列表
- 显示成员数和在线状态
- 最后消息预览
- 搜索过滤
- 新建团队按钮

---

### 2. 群聊界面 (TeamChatPage)

**路径**: `/team/:teamId`

**布局**:
```
┌─────────────────────────────────────────────────────────┐
│  ←  支付链路重构                    4成员·3在线  [⚙️] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│     ┌─ 架构师(Claude) ─┐                               │
│     │ 我已经分析了...   │                               │
│     │ ⚙️ task_analyze   │                               │
│     │ in: 2,184         │                               │
│     │ $0.0184           │                               │
│     └───────────────────┘                               │
│                                                         │
│                   ┌─ Dy ─┐                              │
│                   │ @Claude 请优化...                   │
│                   └──────┘                              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  🔍 输入消息，使用 @ 提及 Agent...           [➤]       │
├─────────────────────────────────────────────────────────┤
│  ▲ 工作空间终端 关联 Claude，目录 /Users/.../project    │
│  ┌─────────────────────────────────────────────────────┐│
│  │ $ claude                                            ││
│  │ > 正在分析项目结构...                                ││
│  │ ...                                                 ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**功能**:
- 群聊消息流（气泡式）
- 支持 @提及 Agent
- 消息显示 Token 消耗
- 底部可展开终端抽屉
- 点击 Agent 头像进入详情页

---

### 3. Agent 详情页 (AgentDetailPage)

**路径**: `/team/:teamId/agent/:agentId`

**布局**:
```
┌─────────────────────────────────────────┐
│  ←  架构师 (Claude Code)      [在线●]   │
├─────────────────────────────────────────┤
│                                         │
│         ┌─────────┐                     │
│         │    C    │                     │
│         │  头像   │                     │
│         └─────────┘                     │
│                                         │
│      架构师 (Claude Code)               │
│      状态: 忙碌                         │
│      工作目录: /Users/...               │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  📊 今日统计                            │
│  ├─ 消息发送: 128                       │
│  ├─ 代码生成: 45 文件                   │
│  ├─ Token 消耗: 45,230                  │
│  └─ 费用: $0.45                         │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  🖥️ 独立终端                            │
│  ┌─────────────────────────────────────┐│
│  │ $                                   ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  [🛑 停止]  [🔄 重启]  [📋 日志]        │
└─────────────────────────────────────────┘
```

**功能**:
- Agent 大头像展示
- 角色和状态信息
- 统计数据面板
- 独立终端控制
- 操作按钮（停止/重启/日志）

---

## 组件清单

### 新增组件

| 组件 | 路径 | 说明 |
|------|------|------|
| TeamListPage | `pages/TeamListPage.tsx` | 群组列表页 |
| TeamChatPage | `pages/TeamChatPage.tsx` | 群聊主界面 |
| AgentDetailPage | `pages/AgentDetailPage.tsx` | Agent 详情页 |
| TeamSidebar | `components/TeamSidebar.tsx` | 左侧团队导航 |
| ChatHeader | `components/ChatHeader.tsx` | 聊天头部 |
| MessageList | `components/MessageList.tsx` | 消息列表 |
| MessageBubble | `components/MessageBubble.tsx` | 消息气泡 |
| ChatInput | `components/ChatInput.tsx` | 聊天输入框 |
| TerminalDrawer | `components/TerminalDrawer.tsx` | 底部终端抽屉 |
| AgentProfile | `components/AgentProfile.tsx` | Agent 信息卡片 |
| MemberList | `components/MemberList.tsx` | 群成员列表 |

### 修改组件

| 组件 | 修改内容 |
|------|----------|
| App.tsx | 改为路由布局 |
| AgentCard.tsx | 简化为列表项样式 |
| Terminal.tsx | 适配抽屉模式 |
| MessagePanel.tsx | 整合到 Chat 组件 |

---

## 样式设计

### 主题变量

```css
:root {
  /* 背景色 */
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #21262d;
  --bg-hover: #30363d;
  
  /* 文字色 */
  --text-primary: #e6edf3;
  --text-secondary: #7d8590;
  --text-muted: #484f58;
  
  /* 强调色 */
  --accent-blue: #2f81f7;
  --accent-green: #238636;
  --accent-purple: #a371f7;
  --accent-orange: #f78166;
  
  /* Agent 标识色 */
  --agent-user: #238636;
  --agent-claude: #a371f7;
  --agent-codex: #f78166;
  --agent-gemini: #4285f4;
  --agent-opencode: #00d4aa;
  
  /* 边框 */
  --border: #30363d;
  --border-light: #21262d;
  
  /* 状态 */
  --status-online: #238636;
  --status-busy: #f78166;
  --status-offline: #7d8590;
}
```

### 组件样式规范

| 元素 | 样式 |
|------|------|
| 卡片圆角 | `border-radius: 12px` |
| 消息气泡圆角 | `border-radius: 18px` |
| 按钮圆角 | `border-radius: 8px` |
| 输入框圆角 | `border-radius: 24px` |
| 阴影 | `0 4px 12px rgba(0,0,0,0.15)` |
| 过渡动画 | `transition: all 0.2s ease` |

---

## 数据结构变更

### 新增表

```sql
-- 团队设置
CREATE TABLE team_settings (
  team_id TEXT PRIMARY KEY,
  theme TEXT DEFAULT 'dark',
  layout TEXT DEFAULT 'chat',
  terminal_height INTEGER DEFAULT 300,
  created_at TEXT NOT NULL
);

-- Agent 详细配置
CREATE TABLE agent_profiles (
  agent_id TEXT PRIMARY KEY,
  avatar_url TEXT,
  description TEXT,
  skills TEXT, -- JSON
  color TEXT, -- 标识色
  created_at TEXT NOT NULL
);

-- 消息表扩展
ALTER TABLE messages ADD COLUMN token_in INTEGER DEFAULT 0;
ALTER TABLE messages ADD COLUMN token_out