import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import type { TotpAuthState } from "@/hooks/useTotpAuth";
import { buildTotpUri } from "@/lib/totp";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface TotpSetupProps {
  secret: string | null;
  verifyCode: TotpAuthState["verifyCode"];
  setupTotp: TotpAuthState["setupTotp"];
}

export default function TotpSetup({
  secret,
  verifyCode,
  setupTotp,
}: TotpSetupProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!secret) {
      setupTotp();
      return;
    }
    const uri = buildTotpUri(secret, "AI Homework Tracker", "User");
    QRCode.toDataURL(uri, { width: 200, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [secret, setupTotp]);

  const handleVerify = async () => {
    setError("");
    setIsPending(true);
    const ok = await verifyCode(code);
    if (!ok) {
      setError("Incorrect code. Please try again.");
      setCode("");
    }
    setIsPending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Branding */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-heading text-lg font-bold leading-none">
              StudyTrack
            </p>
            <p className="text-xs text-muted-foreground">AI Homework Tracker</p>
          </div>
        </div>

        <Card className="shadow-xl border-border">
          <CardHeader className="text-center pb-4 pt-6">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h2 className="font-heading text-xl font-bold">
              Set Up Authenticator
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Scan this QR code with Google Authenticator or Authy, then enter
              the 6-digit code below to confirm.
            </p>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-5 pb-6">
            {/* QR Code */}
            <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="TOTP QR Code"
                  width={180}
                  height={180}
                />
              ) : (
                <div className="h-[180px] w-[180px] flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>

            {/* Manual key hint */}
            {secret && (
              <p className="text-xs text-muted-foreground text-center">
                Can't scan? Enter manually:{" "}
                <span className="font-mono font-medium text-foreground break-all">
                  {secret}
                </span>
              </p>
            )}

            {/* OTP Input */}
            <div className="flex flex-col items-center gap-2">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                data-ocid="totp.input"
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {error && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="totp.error_state"
                >
                  {error}
                </p>
              )}
            </div>

            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={code.length < 6 || isPending}
              data-ocid="totp.submit_button"
            >
              {isPending ? "Verifying…" : "Verify & Continue"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
