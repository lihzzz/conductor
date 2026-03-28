import { z } from "zod";

const idSchema = z.string().min(1);

export const taskStatusSchema = z.enum([
  "pending",
  "claimed",
  "running",
  "completed",
  "failed",
]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const createTeamRequestSchema = z.object({
  name: z.string().min(1),
  workspaceRoot: z.string().min(1),
});
export type CreateTeamRequest = z.infer<typeof createTeamRequestSchema>;

export const startAgentRequestSchema = z.object({
  agentId: idSchema,
  workspace: z.string().min(1),
});
export type StartAgentRequest = z.infer<typeof startAgentRequestSchema>;

export const stopAgentRequestSchema = z.object({
  agentId: idSchema,
});
export type StopAgentRequest = z.infer<typeof stopAgentRequestSchema>;

export const sendAgentInputRequestSchema = z.object({
  agentId: idSchema,
  text: z.string().min(1),
});
export type SendAgentInputRequest = z.infer<typeof sendAgentInputRequestSchema>;

export const sendDirectMessageRequestSchema = z.object({
  teamId: idSchema,
  fromAgentId: idSchema,
  toAgentId: idSchema,
  content: z.string().min(1),
});
export type SendDirectMessageRequest = z.infer<typeof sendDirectMessageRequestSchema>;

export const sendBroadcastMessageRequestSchema = z.object({
  teamId: idSchema,
  fromAgentId: idSchema,
  content: z.string().min(1),
});
export type SendBroadcastMessageRequest = z.infer<typeof sendBroadcastMessageRequestSchema>;

export const dashboardStateRequestSchema = z.object({
  teamId: idSchema,
});
export type DashboardStateRequest = z.infer<typeof dashboardStateRequestSchema>;
