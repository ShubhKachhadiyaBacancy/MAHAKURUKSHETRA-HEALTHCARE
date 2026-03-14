import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/features/auth/login-form";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { getViewerContext } from "@/services/viewer";

export default async function LoginPage() {
  const contactRoute = "/contactus" as Route;
  const viewer = await getViewerContext();
  if (viewer.hasSession) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell">
      <div className="content-shell">
        <SiteHeader
          currentPath="/login"
          navItems={[
            { href: "/", label: "Overview" },
            { href: contactRoute, label: "Contact Us" },
            { href: "/login", label: "Login" },
            { href: "/register", label: "Register" }
          ]}
        />

        <section className="grid gap-8 lg:grid-cols-[1fr_minmax(0,0.85fr)] lg:items-center">
          <div>
            <span className="eyebrow">Workspace access</span>
            <h1 className="mt-3 max-w-3xl font-display text-5xl tracking-tight text-slate-950 sm:text-6xl">
              Sign in and return to the main workspace.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Keep the entry point simple: sign in if your team is already set up,
              or create the organizer account first.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={contactRoute}>
                <Button variant="secondary">Contact us</Button>
              </Link>
              <Link href="/register">
                <Button>Create account</Button>
              </Link>
            </div>
          </div>

          <LoginForm />
        </section>
      </div>
    </main>
  );
}
