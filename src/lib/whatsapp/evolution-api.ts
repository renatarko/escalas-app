import { env } from "@/env";
import type {
  EvolutionConnectionState,
  EvolutionInstance,
  EvolutionQRCode,
  EvolutionSendMessageResponse,
  EvolutionSendTextMessage,
} from "./types";

class EvolutionAPI {
  private baseUrl: string;
  private apiKey: string;
  private instanceName: string;

  constructor() {
    this.baseUrl = env.EVOLUTION_API_URL ?? "";
    this.apiKey = env.EVOLUTION_API_KEY ?? "";
    this.instanceName = env.EVOLUTION_INSTANCE_NAME ?? "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        apikey: this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Evolution API Error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<T>;
  }

  // ==================== INSTANCE MANAGEMENT ====================

  /**
   * Cria uma nova instância do WhatsApp
   */
  async createInstance(
    instanceName: string = this.instanceName,
  ): Promise<EvolutionInstance> {
    return this.request<EvolutionInstance>("/instance/create", {
      method: "POST",
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
      }),
    });
  }

  /**
   * Busca informações de uma instância
   */
  async getInstance(
    instanceName: string = this.instanceName,
  ): Promise<EvolutionInstance> {
    return this.request<EvolutionInstance>(
      `/instance/fetchInstances?instanceName=${instanceName}`,
    );
  }

  /**
   * Obtém o QR Code para conexão
   */
  async getQRCode(
    instanceName: string = this.instanceName,
  ): Promise<EvolutionQRCode> {
    return this.request<EvolutionQRCode>(`/instance/connect/${instanceName}`);
  }

  /**
   * Verifica o estado da conexão
   */
  async getConnectionState(
    instanceName: string = this.instanceName,
  ): Promise<EvolutionConnectionState> {
    return this.request<EvolutionConnectionState>(
      `/instance/connectionState/${instanceName}`,
    );
  }

  /**
   * Desconecta a instância (logout)
   */
  async logout(instanceName: string = this.instanceName): Promise<void> {
    await this.request(`/instance/logout/${instanceName}`, {
      method: "DELETE",
    });
  }

  /**
   * Deleta a instância
   */
  async deleteInstance(
    instanceName: string = this.instanceName,
  ): Promise<void> {
    await this.request(`/instance/delete/${instanceName}`, {
      method: "DELETE",
    });
  }

  /**
   * Reinicia a instância
   */
  async restartInstance(
    instanceName: string = this.instanceName,
  ): Promise<void> {
    await this.request(`/instance/restart/${instanceName}`, {
      method: "PUT",
    });
  }

  // ==================== MESSAGING ====================

  /**
   * Envia mensagem de texto
   */
  async sendText(
    data: EvolutionSendTextMessage,
    instanceName: string = this.instanceName,
  ): Promise<EvolutionSendMessageResponse> {
    // Formata o número para o padrão brasileiro
    const formattedNumber = this.formatPhoneNumber(data.number);

    return this.request<EvolutionSendMessageResponse>(
      `/message/sendText/${instanceName}`,
      {
        method: "POST",
        body: JSON.stringify({
          number: formattedNumber,
          textMessage: {
            text: data.text,
          },
          options: {
            delay: data.delay ?? 1200,
            linkPreview: data.linkPreview ?? false,
          },
        }),
      },
    );
  }

  /**
   * Verifica se um número tem WhatsApp
   */
  async checkNumberExists(
    number: string,
    instanceName: string = this.instanceName,
  ): Promise<{ exists: boolean; jid: string }> {
    const formattedNumber = this.formatPhoneNumber(number);

    const response = await this.request<{
      exists: boolean;
      jid: string;
      number: string;
    }>(`/chat/whatsappNumbers/${instanceName}`, {
      method: "POST",
      body: JSON.stringify({
        numbers: [formattedNumber],
      }),
    });

    return {
      exists: response.exists,
      jid: response.jid,
    };
  }

  // ==================== UTILITIES ====================

  /**
   * Formata número de telefone para o padrão WhatsApp Brasil
   * Aceita formatos: (11) 99999-9999, 11999999999, +5511999999999
   */
  formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    let cleaned = phone.replaceAll(/\D/g, "");

    // Se começar com 0, remove
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }

    // Se não tiver código do país, adiciona 55 (Brasil)
    if (!cleaned.startsWith("55") && cleaned.length <= 11) {
      cleaned = `55${cleaned}`;
    }

    return cleaned;
  }

  /**
   * Verifica se a instância está conectada
   */
  async isConnected(
    instanceName: string = this.instanceName,
  ): Promise<boolean> {
    try {
      const state = await this.getConnectionState(instanceName);
      return state.state === "open";
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const evolutionAPI = new EvolutionAPI();

// Export class for testing
export { EvolutionAPI };
