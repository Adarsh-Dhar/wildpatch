import { notFound } from "next/navigation";
import PreviewShowcase from "./PreviewShowcase";
import { getProfile } from "@/lib/api";

export default async function PostPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const profile = await getProfile();
  return <PreviewShowcase streak={profile.streak} />;
}
