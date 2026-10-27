"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";
import { useOnboarding } from "@/app/lib/use-onboarding";

const SNOOZE_KEY = "varban_onboarding_snooze_until";
const SNOOZE_MS = 24 * 60 * 60 * 1000;
export const REGISTRATION_PATH = "/client/complete-registration";

/**
 * Thin strip under the header on every signed-in page until the account is set up.
 * Only admins can postpone it ("Remind me later"); everyone else sees it until done.
 */
export default function OnboardingBanner() {
  const pathname = usePathname();
  const { ready, state, isAdmin } = useOnboarding();
  const [snoozed, setSnoozed] = useState(false);

  useEffect(() => {
    try {
      const until = Number(localStorage.getItem(SNOOZE_KEY) || 0);
      setSnoozed(until > Date.now());
    } catch {}
  }, []);

  if (!ready || state.complete || pathname === REGISTRATION_PATH) return null;
  if (isAdmin && snoozed) return null;

  const remaining = state.steps.length - state.doneCount;
  const missingTitles = state.steps.filter((s) => !s.done).map((s) => s.title.toLowerCase());

  const remindLater = () => {
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS)); } catch {}
    setSnoozed(true);
  };

  return (
    <div role="status" className="shrink-0 bg-[#0055FF]/5 border-b border-[#0055FF]/20 px-4 md:px-8 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      <Info className="w-4 h-4 text-[#0055FF] shrink-0" />
      <p className="flex-1 min-w-[220px] text-xs text-[#0A0A0A] leading-relaxed">
        <span className="font-bold">Finish setting up your account to start trading.</span>{" "}
        <span className="text-[#6B7280]">
          {remaining === 1 ? "1 step" : `${remaining} steps`} left: {missingTitles.join(", ")}.
        </span>
      </p>
      <div className="flex items-center gap-3">
        <Link
          href={REGISTRATION_PATH}
          className="px-4 py-2 bg-[#0055FF] text-white text-[11px] font-bold hover:bg-[#0044cc] transition-colors"
        >
          Continue setup
        </Link>
        {isAdmin && (
          <button
            type="button"
            onClick={remindLater}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6B7280] hover:text-[#0055FF] transition-colors"
          >
            <X className="w-3 h-3" /> Remind me later
          </button>
        )}
      </div>
    </div>
  );
}
