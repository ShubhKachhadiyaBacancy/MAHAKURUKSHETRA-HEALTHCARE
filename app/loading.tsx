import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="page-shell">
      <div className="content-shell">
        <div className="panel flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>

        <section className="grid gap-10 lg:grid-cols-[1.05fr_minmax(0,0.95fr)] lg:items-center">
          <div className="space-y-6">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-16 w-full max-w-3xl rounded-[30px]" />
            <Skeleton className="h-16 w-11/12 max-w-3xl rounded-[30px]" />
            <Skeleton className="h-5 w-full max-w-2xl" />
            <Skeleton className="h-5 w-4/5 max-w-2xl" />
            <div className="flex gap-3">
              <Skeleton className="h-12 w-40 rounded-full" />
              <Skeleton className="h-12 w-28 rounded-full" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="panel-muted rounded-[28px] p-4" key={index}>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-4/5" />
                </div>
              ))}
            </div>
          </div>

          <div className="panel min-h-[540px] overflow-hidden p-6">
            <div className="grid h-full gap-4 lg:grid-rows-[auto_1fr_auto]">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-6 w-52" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="panel-muted rounded-[28px] p-5">
                  <Skeleton className="h-20 w-20 rounded-[24px]" />
                  <div className="mt-6 space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div className="space-y-3" key={index}>
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-2.5 w-full rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div className="panel-muted rounded-[24px] p-5" key={index}>
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="mt-3 h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div className="panel-muted rounded-[20px] p-4" key={index}>
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="mt-3 h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
