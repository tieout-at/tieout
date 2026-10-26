import { DASHBOARDS } from "@/lib/reports";
import { Dashboard } from "./dashboard";

export const metadata = { title: "Berichte" };

export default function BerichtePage() {
  return <Dashboard slug={DASHBOARDS[0].slug} />;
}
