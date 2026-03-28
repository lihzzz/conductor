export type MessageType = "direct" | "broadcast";
export type MessageDeliveryStatus = "queued" | "delivered" | "read";

export interface RoutedMessage {
  id: string;
  teamId: string;
  fromAgentId: string;
  toAgentId: string | null;
  type: MessageType;
  content: string;
  deliveryStatus: MessageDeliveryStatus;
  createdAt: string;
}

export interface MessageRepository {
  createMessage(message: RoutedMessage): Promise<void>;
  markMessageStatus(messageId: string, status: MessageDeliveryStatus): Promise<void>;
}

export class MessageRouterService {
  constructor(private readonly repository: MessageRepository) {}

  async sendDirect(
    id: string,
    teamId: string,
    fromAgentId: string,
    toAgentId: string,
    content: string
  ): Promise<RoutedMessage> {
    const queuedMessage: RoutedMessage = {
      id,
      teamId,
      fromAgentId,
      toAgentId,
      type: "direct",
      content,
      deliveryStatus: "queued",
      createdAt: new Date().toISOString(),
    };
    await this.repository.createMessage(queuedMessage);
    await this.repository.markMessageStatus(id, "delivered");

    return {
      ...queuedMessage,
      deliveryStatus: "delivered",
    };
  }

  async broadcast(
    id: string,
    teamId: string,
    fromAgentId: string,
    content: string
  ): Promise<RoutedMessage> {
    const queuedMessage: RoutedMessage = {
      id,
      teamId,
      fromAgentId,
      toAgentId: null,
      type: "broadcast",
      content,
      deliveryStatus: "queued",
      createdAt: new Date().toISOString(),
    };
    await this.repository.createMessage(queuedMessage);
    await this.repository.markMessageStatus(id, "delivered");

    return {
      ...queuedMessage,
      deliveryStatus: "delivered",
    };
  }

  async markDelivered(messageId: string): Promise<void> {
    await this.repository.markMessageStatus(messageId, "delivered");
  }
}
