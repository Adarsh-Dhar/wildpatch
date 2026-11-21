import { notFound } from "next/navigation";
import GalleryShowcase from "./GalleryShowcase";

export default function GalleryPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <GalleryShowcase />;
}
