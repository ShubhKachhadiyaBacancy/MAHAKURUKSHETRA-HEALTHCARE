"use client";

import { useState } from "react";

export function useIntakeSteps(totalSteps: number) {
  const [stepIndex, setStepIndex] = useState(0);

  return {
    stepIndex,
    isFirstStep: stepIndex === 0,
    isLastStep: stepIndex === totalSteps - 1,
    next() {
      setStepIndex((current) => Math.min(current + 1, totalSteps - 1));
    },
    previous() {
      setStepIndex((current) => Math.max(current - 1, 0));
    },
    reset() {
      setStepIndex(0);
    }
  };
}
