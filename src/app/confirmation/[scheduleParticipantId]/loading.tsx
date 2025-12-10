import { Card, CardContent, CardHeader } from "@/app/_components/ui/card";
import { Calendar, CheckCircle2, Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-green-100">
            <Loader2 className="h-12 w-12 animate-spin text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800">
            Confirmando sua presença...
          </h2>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-3 text-gray-600">
            <Calendar className="h-5 w-5 animate-pulse" />
            <span>Processando sua confirmação</span>
            <CheckCircle2 className="h-5 w-5 animate-pulse text-green-500" />
          </div>

          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <div className="h-3 w-3 animate-bounce rounded-full bg-green-500 [animation-delay:-0.3s]" />
              <div className="h-3 w-3 animate-bounce rounded-full bg-green-600 [animation-delay:-0.15s]" />
              <div className="h-3 w-3 animate-bounce rounded-full bg-green-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
