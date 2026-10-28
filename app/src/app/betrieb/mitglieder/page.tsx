import { Members } from "./members";

export const metadata = { title: "Mitglieder · Betrieb" };

// The members of the own company once signed in (step 10); in the demo the empty state with the way to sign in.
export default function MitgliederPage() {
  return <Members />;
}
