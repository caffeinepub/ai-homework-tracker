import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";

const APP_DETAILS = `StudyTrack - AI Homework Tracker
Version: 1.0.0
Your smart study companion`;

export default function AppDetailsQR() {
  return (
    <div className="flex justify-center py-4">
      <Card className="shadow-card w-fit">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg overflow-hidden border border-border p-1.5 bg-white">
            <QRCodeSVG
              value={APP_DETAILS}
              size={72}
              bgColor="#ffffff"
              fgColor="#1e1e2e"
              level="M"
            />
          </div>
          <div>
            <p className="font-heading font-semibold text-sm">App Details</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Scan to share this app
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1 leading-tight max-w-[140px]">
              StudyTrack v1.0.0
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
