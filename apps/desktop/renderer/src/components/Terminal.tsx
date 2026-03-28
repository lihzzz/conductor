import { useEffect, useRef, useCallback, useState } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import "@xterm/xterm/css/xterm.css";

interface TerminalProps {
  agentId: string;
  onInput: (data: string) => void;
}

// 从 window API 获取类型
type ConductorApi = typeof window.conductorApi;

export function Terminal({ agentId, onInput }: TerminalProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const onInputRef = useRef(onInput);
  const apiRef = useRef<ConductorApi>(window.conductorApi);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 保持 onInput 引用最新
  useEffect(() => {
    onInputRef.current = onInput;
  }, [onInput]);

  // 终端初始化
  useEffect(() => {
    if (!containerRef.current || !apiRef.current) {
      setError("Terminal container or API not available");
      return;
    }

    const terminal = new XTerminal({
      theme: {
        background: "#0f172a",
        foreground: "#d1e7ff",
        cursor: "#d1e7ff",
        cursorAccent: "#0f172a",
        selectionBackground: "#3b82f6",
        black: "#1e293b",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#eab308",
        blue: "#3b82f6",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#f1f5f9",
        brightBlack: "#475569",
        brightRed: "#f87171",
        brightGreen: "#4ade80",
        brightYellow: "#facc15",
        brightBlue: "#60a5fa",
        brightMagenta: "#c084fc",
        brightCyan: "#22d3ee",
        brightWhite: "#ffffff",
      },
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      fontSize: 13,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: "block",
      scrollback: 100000,
      allowProposedApi: true,
      // 高性能渲染配置
      screenReaderMode: false,
      smoothScrollDuration: 0,
      fastScrollModifier: "alt",
      fastScrollSensitivity: 5,
      scrollSensitivity: 1,
      // 减少渲染延迟
      drawBoldTextInBrightColors: true,
      letterSpacing: 0,
      wordSeparator: " \"()[]{}',;",
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);

    // 尝试加载 WebGL 渲染器（大幅提升性能）
    try {
      const webglAddon = new WebglAddon();
      terminal.loadAddon(webglAddon);
      console.log(`[Terminal ${agentId}] WebGL renderer enabled`);
    } catch (e) {
      console.warn(`[Terminal ${agentId}] WebGL not available, using canvas fallback`);
    }

    // 延迟 fit 确保容器已渲染
    requestAnimationFrame(() => {
      fitAddon.fit();
      setIsReady(true);
    });

    // 用户输入处理 - 支持普通字符和特殊键
    terminal.onData((data) => {
      onInputRef.current(data);
    });

    // 处理特殊按键（如 Ctrl+C, Ctrl+D 等）
    terminal.onKey(({ key, domEvent }) => {
      const ev = domEvent;
      // 确保特殊组合键能正确传递
      if (ev.ctrlKey || ev.altKey || ev.metaKey) {
        const code = ev.key.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          // Ctrl+A-Z
          const ctrlCode = code - 64;
          ev.preventDefault();
          onInputRef.current(String.fromCharCode(ctrlCode));
        }
      }
    });

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current && terminalRef.current) {
        try {
          fitAddonRef.current.fit();
        } catch (e) {
          // 忽略 resize 时的错误
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // 直接通过 IPC 订阅输出（绕过 React state）
    const unbindOutput = apiRef.current.onAgentOutputById(agentId, (chunk) => {
      if (terminalRef.current) {
        // 使用 write 直接写入，不经过 React 渲染周期
        terminalRef.current.write(chunk);
      }
    });

    return () => {
      unbindOutput();
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [agentId]);

  // 键盘聚焦处理
  const handleClick = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.focus();
    }
  }, []);

  if (error) {
    return (
      <div className="terminal-error">
        <span>⚠️ {error}</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="terminal-container"
      onClick={handleClick}
      style={{
        opacity: isReady ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
    />
  );
}
