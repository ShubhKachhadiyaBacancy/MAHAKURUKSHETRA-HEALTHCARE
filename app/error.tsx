"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-shell">
      <div className="content-shell">
        <div className="panel max-w-2xl p-8">
          <span className="eyebrow">Application error</span>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-slate-950">
            Something went wrong in the workspace.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">{error.message}</p>
          <div className="mt-6">
            <Button onClick={reset} type="button">
              Retry
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
