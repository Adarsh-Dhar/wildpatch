import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { auth } from "@/lib/auth";

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) redirect("/");

  return (
    <main className="auth-page">
      <a className="auth-back" href="/">← Back to the field</a>
      <section className="auth-card">
        <span className="eyebrow">WILDPATCH FIELD JOURNAL</span>
        <h1>Your work, saved.</h1>
        <p>Sign in to submit your field report and keep your best result.</p>
        <AuthForm />
      </section>
    </main>
  );
}
