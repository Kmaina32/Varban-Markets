/**
 * @fileOverview What "finished setting up" means for an account, in three steps:
 * personal details, address, and the ID check (documents uploaded).
 * Built on getProfileGaps so the rules live in one place.
 */
import { getProfileGaps } from "./profile-completion";

export type OnboardingStepId = "details" | "address" | "identity";

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  hint: string;
  done: boolean;
  /** Plain-English list of what is still missing for this step. */
  missing: string[];
}

export interface OnboardingState {
  steps: OnboardingStep[];
  doneCount: number;
  complete: boolean;
  /** First step that still needs attention, or null when everything is done. */
  next: OnboardingStep | null;
}

const ADDRESS_KEYS = new Set(["country", "addressLine1", "city", "zipCode"]);

/** Documents count as handed in once they are under review or approved. */
export const identityUploaded = (userDoc: any) => {
  const s = userDoc?.status?.verificationStatus;
  return s === "Pending" || s === "Verified";
};

export function getOnboardingState(userDoc: any): OnboardingState {
  const gaps = getProfileGaps(userDoc);
  const addressMissing = gaps.filter((g) => ADDRESS_KEYS.has(g.key)).map((g) => g.label);
  const detailsMissing = gaps.filter((g) => !ADDRESS_KEYS.has(g.key)).map((g) => g.label);
  const rejected = userDoc?.status?.verificationStatus === "Rejected";
  const uploaded = identityUploaded(userDoc);

  const steps: OnboardingStep[] = [
    {
      id: "details",
      title: "Your details",
      hint: "Name, date of birth, phone number and a few questions about you",
      done: detailsMissing.length === 0,
      missing: detailsMissing,
    },
    {
      id: "address",
      title: "Your address",
      hint: "Where you live",
      done: addressMissing.length === 0,
      missing: addressMissing,
    },
    {
      id: "identity",
      title: "Confirm who you are",
      hint: "Upload your ID and take a quick selfie",
      done: uploaded,
      missing: uploaded
        ? []
        : [rejected ? "Your last ID check was not accepted, please send it again" : "ID photos and a selfie"],
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  return {
    steps,
    doneCount,
    complete: doneCount === steps.length,
    next: steps.find((s) => !s.done) ?? null,
  };
}
