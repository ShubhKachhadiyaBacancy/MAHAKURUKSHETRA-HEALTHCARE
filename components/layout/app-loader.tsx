"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export function AppLoader() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const initialMount = useRef(true);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!visible) {
    return null;
  }

  return (
    <div className="app-loader" aria-busy="true" aria-live="polite">
      <div className="app-loader__sheet">
        <div className="app-loader__header">
          <div className="app-loader__brand">SR</div>
          <div>
            <span className="eyebrow">Loading workspace</span>
            <p className="app-loader__title">Preparing the next therapy view</p>
          </div>
        </div>

        <div className="app-loader__grid">
          <div className="panel-muted rounded-[24px] p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-8 w-20" />
            <Skeleton className="mt-4 h-3.5 w-full" />
            <Skeleton className="mt-2 h-3.5 w-4/5" />
          </div>

          <div className="panel-muted rounded-[24px] p-4">
            <Skeleton className="h-4 w-32" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton className="h-3.5 w-full" key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
