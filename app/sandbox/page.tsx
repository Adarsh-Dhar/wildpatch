import { notFound, redirect } from "next/navigation";

export default function SandboxPage() {
  if (process.env.NODE_ENV === "production") notFound();
  redirect("/");
}
