import Dashboard from "@/components/Dashboard";
import TotpSetup from "@/components/TotpSetup";
import TotpVerify from "@/components/TotpVerify";
import { Toaster } from "@/components/ui/sonner";
import { useTotpAuth } from "@/hooks/useTotpAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

function AppContent() {
  const { status, secret, setupTotp, verifyCode, resetTotp } = useTotpAuth();

  if (status === "not_setup") {
    return (
      <TotpSetup
        secret={secret}
        verifyCode={verifyCode}
        setupTotp={setupTotp}
      />
    );
  }

  if (status === "setup_pending_verify") {
    return <TotpVerify verifyCode={verifyCode} resetTotp={resetTotp} />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster position="bottom-right" richColors />
    </QueryClientProvider>
  );
}
