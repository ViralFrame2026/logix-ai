export type AiRequestContext = {
  organizationId: string;
  userId: string;
  allowedWarehouseIds: string[];
};

export type AiAssistantRequest = {
  prompt: string;
  context: AiRequestContext;
};

export type AiAssistantResponse = {
  answer: string;
  inputTokens: number;
  outputTokens: number;
  providerRequestId: string;
};

export interface AiProvider {
  complete(request: AiAssistantRequest): Promise<AiAssistantResponse>;
}

export class DisabledAiProvider implements AiProvider {
  async complete(): Promise<AiAssistantResponse> {
    throw new Error("El asistente de IA todavía no está habilitado.");
  }
}
