import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/features/auth/register-form";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";
import { getViewerContext } from "@/services/viewer";

export default async function RegisterPage() {
  const contactRoute = "/contactus" as Route;
  const viewer = await getViewerContext();
  if (viewer.hasSession) {
    redirect("/intake");
  }

  const onboardingFlow = [
    {
      title: "1. Create the organizer account",
      body: "This provisions the first workspace owner and creates the organization shell."
    },
    {
      title: "2. Invite the team",
      body: "Organizers add doctors and patients after sign-in."
    },
    {
      title: "3. Start intake",
      body: "Patient registration and therapy workflows stay inside the authenticated workspace."
    }
  ];

  return (
    <main className="page-shell register-page">
      <div className="content-shell">
        <SiteHeader
          currentPath="/register"
          navItems={[
            { href: "/", label: "Overview" },
            { href: contactRoute, label: "Contact Us" },
            { href: "/login", label: "Login" },
            { href: "/register", label: "Register" }
          ]}
        />

        <section className="grid gap-6 xl:grid-cols-[1.15fr_minmax(0,0.85fr)]">
          <RegisterForm />

          <div className="section-stack">
            <section className="space-y-4">
              {onboardingFlow.map((step) => (
                <Card className="register-subtle-surface px-6 py-5" key={step.title}>
                  <div className="register-kicker text-[11px] uppercase tracking-[0.28em]">
                    {step.title}
                  </div>
                  <p className="register-body mt-3 text-sm leading-7">{step.body}</p>
                </Card>
              ))}

              <Card className="register-subtle-surface relative overflow-hidden p-6">
                <div className="relative">
                  <span className="eyebrow register-kicker">Next step after registration</span>
                  <div className="mt-4 space-y-3 text-sm leading-7 register-body">
                    <p>
                      Sign in, invite doctors and patients, and begin intake from the main workspace.
                    </p>
                  </div>
                  <Link
                    className="register-link mt-5 inline-flex text-sm font-medium underline"
                    href="/login"
                  >
                    Prefer an existing account? Sign in
                  </Link>
                </div>
              </Card>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
