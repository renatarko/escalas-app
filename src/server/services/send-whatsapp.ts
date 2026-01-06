import { env } from "@/env";

export async function sendWhatsAppMessage(number: string, text: string) {
  const instanceName = env.EVOLUTION_INSTANCE_NAME;
  const instanceApiKey = env.EVOLUTION_API_KEY;
  const serverUrl = env.EVOLUTION_API_URL;

  try {
    const response = await fetch(
      `${serverUrl}/message/sendText/${instanceName}`,
      {
        method: "POST",
        headers: {
          apikey: instanceApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number,
          text,
          delay: 2000,
        }),
      },
    );

    const data = (await response.json()) as unknown;

    if (!response.ok) {
      console.error("Erro da API:", data);
      throw new Error(data?.message || "Erro desconhecido");
    }

    console.log(`Mensagem enviada para ${number}`);
    console.log(`data `, data);
    return data;
  } catch (error) {
    console.error(`Erro ao enviar mensagem para ${number}:`, error);
    throw error;
  }
}
