import PreviewShowcase from "./PreviewShowcase";
import { getProfile } from "@/lib/api";

export default async function PostPreviewPage() {
  const profile = await getProfile();
  return <PreviewShowcase streak={profile.streak} />;
}
