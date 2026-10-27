"use client";

import Link from "next/link";
import { Lock, Check, Circle } from "lucide-react";
import { useOnboarding } from "@/app/lib/use-onboarding";
import { REGISTRATION_PATH } from "./OnboardingBanner";

/** Shown in place of the order ticket (or bot start button) until setup is finished. */
export default function TradingLock({ compact = false }: { compact?: boolean }) {
  const { state } = useOnboarding();
  return (
    <div className={compact ? "p-4" : "p-6 h-full flex items-center justify-center"}>
      <div className="w-full max-w-sm bg-white border border-[#E4E4E4] border-t-4 border-t-[#0055FF] p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-[#0055FF]/10 flex items-center justify-center">
            <Lock className="w-4 h-4 text-[#0055FF]" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#0A0A0A]">Trading is almost ready</h3>
            <p className="text-xs text-[#6B7280]">Finish these steps to trade with real money.</p>
          </div>
        </div>
        <ul className="space-y-2">
          {state.steps.map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-xs">
              {s.done ? <Check className="w-4 h-4 text-[#16835B]" /> : <Circle className="w-4 h-4 text-[#C4C4C4]" />}
              <span className={s.done ? "text-[#6B7280] line-through" : "text-[#0A0A0A] font-bold"}>{s.title}</span>
            </li>
          ))}
        </ul>
        <Link
          href={REGISTRATION_PATH}
          className="block text-center px-4 py-3 bg-[#0055FF] text-white text-xs font-bold hover:bg-[#0044cc] transition-colors"
        >
          Finish setup
        </Link>
        <p className="text-[11px] text-[#6B7280] text-center">You can still look around and practise on the demo account.</p>
      </div>
    </div>
  );
}
