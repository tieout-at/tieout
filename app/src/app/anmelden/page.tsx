import { Page } from "@/components/shell/page";
import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Anmelden" };

// Sign-in for companies with an account (step 10). The sample data stay open without it.
export default function AnmeldenPage() {
  return (
    <Page title="Anmelden">
      <SignInForm />
    </Page>
  );
}
