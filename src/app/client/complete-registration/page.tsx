"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import AuthedLayout from "@/components/layout/AuthedLayout";
import ProfileTab from "@/components/account/ProfileTab";
import KycTab from "@/components/account/KycTab";
import { useOnboarding } from "@/app/lib/use-onboarding";
import { cn } from "@/app/lib/utils";

type View = "form" | "identity";

export default function CompleteRegistrationPage() {
  const { ready, state } = useOnboarding();
  const [view, setView] = useState<View | null>(null);

  // Start on the first thing that still needs doing; the person can click any step to go back.
  useEffect(() => {
    if (!ready || view) return;
    setView(state.next?.id === "identity" ? "identity" : "form");
  }, [ready, state.next, view]);

  const formDone = state.steps[0].done && state.steps[1].done;

  return (
    <AuthedLayout title="Finish setting up" subtitle="Three quick steps">
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <div>
          <h2 className="text-xl font-bold text-[#0A0A0A]">Finish setting up your account</h2>
          <p className="text-sm text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
            We are required to check who our clients are before they trade. It takes a few minutes, and you
            only do it once. You can browse the platform and use the demo account while you finish.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {state.steps.map((s, i) => {
            const target: View = s.id === "identity" ? "identity" : "form";
            const active = view === target;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setView(target)}
                  className={cn(
                    "w-full text-left p-4 bg-white border flex items-start gap-3 transition-colors",
                    active ? "border-[#0055FF] shadow-sm" : "border-[#E4E4E4] hover:border-[#0055FF]/50"
                  )}
                >
                  <span
                    className={cn(
                      "w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold",
                      s.done ? "bg-[#16835B] text-white" : active ? "bg-[#0055FF] text-white" : "bg-[#F7F7F5] text-[#6B7280] border border-[#E4E4E4]"
                    )}
                  >
                    {s.done ? <Check className="w-4 h-4" /> : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[#0A0A0A]">{s.title}</span>
                    <span className="block text-xs text-[#6B7280] mt-0.5 leading-snug">
                      {s.done ? "Done" : s.hint}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {ready && state.complete && (
          <div className="p-5 bg-[#16835B]/5 border border-[#16835B]/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#16835B]">You are all set</p>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Your documents are with our team for review. You can start trading now.
              </p>
            </div>
            <Link
              href="/client/terminal"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#0055FF] text-white text-xs font-bold hover:bg-[#0044cc] transition-colors"
            >
              Go to trading <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {view === "form" && (
          <ProfileTab onCompleted={() => setView("identity")} />
        )}
        {view === "identity" && (
          formDone ? (
            <KycTab />
          ) : (
            <div className="p-5 bg-white border border-[#E4E4E4] space-y-3">
              <p className="text-sm font-bold text-[#0A0A0A]">Please fill in your details and address first</p>
              <p className="text-xs text-[#6B7280]">We need them before you can upload your ID.</p>
              <button
                type="button"
                onClick={() => setView("form")}
                className="px-4 py-2 bg-[#0055FF] text-white text-xs font-bold hover:bg-[#0044cc] transition-colors"
              >
                Go to my details
              </button>
            </div>
          )
        )}
      </div>
    </AuthedLayout>
  );
}
