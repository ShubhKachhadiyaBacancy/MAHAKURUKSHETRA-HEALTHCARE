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
      title: "1. Create the admin shell",
      body: "This is the only public registration path. It provisions the Supabase auth user, seeds the organization, and builds the admin workspace."
    },
    {
      title: "2. Invite providers and case managers",
      body: "Admins use the workspace admin console to add collaborators, which attaches provider and case-manager operational records with the right ownership."
    },
    {
      title: "3. Register patients after sign-in",
      body: "Authenticated admins, providers, and case managers use the intake workspace to register patients, prescriptions, prior auth, and affordability cases."
    },
    {
      title: "4. External stakeholders consume analytics",
      body: "Pharmacies, payers, and manufacturers access controlled analytics paths. No public self-registration is exposed for them."
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
                      Sign in to access the workspace, invite providers and case managers from
                      the admin console, and register patients through the authenticated intake
                      experience.
                    </p>
                    <p>
                      External stakeholders such as pharmacies and payers consume controlled
                      analytics rather than public signup flows.
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
