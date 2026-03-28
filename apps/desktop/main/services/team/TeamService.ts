import { AppRepository } from "../../repositories/AppRepository";

export class TeamService {
  constructor(private readonly repository: AppRepository) {}

  createTeam(input: { name: string; workspaceRoot: string }): {
    teamId: string;
    agentIds: string[];
  } {
    const team = this.repository.createTeam(input.name, input.workspaceRoot);

    // 只创建两个 Agent: lead + dev
    const lead = this.repository.createAgent(team.id, "lead", "lead");
    const dev = this.repository.createAgent(team.id, "dev", "dev");

    return { teamId: team.id, agentIds: [lead.id, dev.id] };
  }
}