import { createFileRoute } from "@tanstack/react-router";
import { BankApplicationForm } from "@/components/BankApplicationForm";
import { Toaster } from "@/components/ui/sonner";
import { Landmark, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Open a Bank Account | Northstar Bank" },
      { name: "description", content: "Apply for a Northstar Bank account in minutes — secure, paperless, and quick." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Landmark className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Northstar Bank</span>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Bank-grade encryption
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Open Your Bank Account
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Complete the four short steps below. Your progress is saved automatically when you choose Save Draft.
          </p>
        </div>
        <BankApplicationForm />
      </main>

      <Toaster />
    </div>
  );
}
