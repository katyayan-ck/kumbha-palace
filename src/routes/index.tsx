import { createFileRoute } from "@tanstack/react-router";
import { PalaceViewer } from "@/components/palace-viewer";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <PalaceViewer />;
}
