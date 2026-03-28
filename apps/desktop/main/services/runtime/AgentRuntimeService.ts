import EventEmitter from "node:events";
import * as pty from "node-pty";
import type { IPty } from "node-pty";

type AgentExitEvent = {
  agentId: string;
  exitCode: number;
  signal?: number;
};

type AgentOutputEvent = {
  agentId: string;
  chunk: string;
};

export class AgentRuntimeService {
  private readonly processes = new Map<string, IPty>();
  private readonly emitter = new EventEmitter();

  async startAgent(agentId: string, workspace: string): Promise<number> {
    if (this.processes.has(agentId)) {
      throw new Error(`Agent already running: ${agentId}`);
    }

    const process = pty.spawn("claude", [], {
      name: "xterm-color",
      cwd: workspace,
      env: processEnvWithWorkspace(workspace),
      cols: 120,
      rows: 36,
    });

    process.onData((chunk) => {
      this.emitter.emit("output", {
        agentId,
        chunk,
      } satisfies AgentOutputEvent);
    });

    process.onExit(({ exitCode, signal }) => {
      this.processes.delete(agentId);
      this.emitter.emit("exit", {
        agentId,
        exitCode,
        signal,
      } satisfies AgentExitEvent);
    });

    this.processes.set(agentId, process);
    return process.pid;
  }

  async stopAgent(agentId: string): Promise<void> {
    const process = this.processes.get(agentId);
    if (!process) return;

    process.kill();
    this.processes.delete(agentId);
  }

  sendInput(agentId: string, text: string): void {
    const process = this.processes.get(agentId);
    if (!process) {
      throw new Error(`Agent is not running: ${agentId}`);
    }
    process.write(text);
  }

  isRunning(agentId: string): boolean {
    return this.processes.has(agentId);
  }

  onOutput(listener: (event: AgentOutputEvent) => void): () => void {
    this.emitter.on("output", listener);
    return () => this.emitter.off("output", listener);
  }

  onExit(listener: (event: AgentExitEvent) => void): () => void {
    this.emitter.on("exit", listener);
    return () => this.emitter.off("exit", listener);
  }
}

function processEnvWithWorkspace(workspace: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    PWD: workspace,
  };
}
