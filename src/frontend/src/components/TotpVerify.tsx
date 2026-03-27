import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import type { TotpAuthState } from "@/hooks/useTotpAuth";
import { GraduationCap, KeyRound } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface TotpVerifyProps {
  verifyCode: TotpAuthState["verifyCode"];
  resetTotp: TotpAuthState["resetTotp"];
}

export default function TotpVerify({ verifyCode, resetTotp }: TotpVerifyProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

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
        className="w-full max-w-sm"
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
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h2 className="font-heading text-xl font-bold">
              Enter Authenticator Code
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Open your authenticator app and enter the 6-digit code.
            </p>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-5 pb-6">
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
              {isPending ? "Verifying…" : "Verify"}
            </Button>

            <button
              type="button"
              onClick={resetTotp}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
              data-ocid="totp.secondary_button"
            >
              Reset authenticator
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
