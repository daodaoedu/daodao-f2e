"use client";

import { Button } from "@daodao/ui/components/button";
import { Card, CardContent } from "@daodao/ui/components/card";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ThankYouPageProps {
  message?: string;
  redirectPath?: string;
}

export function ThankYouPage({
  message = "感謝你的回應！",
  redirectPath = "/",
}: ThankYouPageProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-xl font-semibold">{message}</h2>
          <p className="text-sm text-muted-foreground">你的回應已成功提交</p>
          <Button variant="outline" onClick={() => router.push(redirectPath)}>
            回到首頁
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
