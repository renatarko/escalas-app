import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { useSendWhatsAppConfirmation } from "@/hooks/use-whatsapp-notification";

export const NotificationBtnParticipant = ({
  scheduleId,
  participantId,
  hasWhatsapp,
}: {
  scheduleId: string;
  participantId: string;
  hasWhatsapp: boolean;
}) => {
  const sendConfirmations = useSendWhatsAppConfirmation();

  const handleNotify = async () => {
    await sendConfirmations.mutateAsync({ scheduleId, participantId });
  };

  return (
    <Button
      variant="outline"
      onClick={handleNotify}
      disabled={sendConfirmations.isPending}
    >
      <Send className="size-4 text-green-600" />
      Enviar notificação
    </Button>
  );
};
