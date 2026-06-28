import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = { title: "Terms of Service — VibeCheck" };

const CONTACT = "support@vibecheckhq.app";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 28, 2026">
      <p>
        By using VibeCheck you agree to these terms. If you don&rsquo;t agree,
        please don&rsquo;t use the service.
      </p>

      <h2>What VibeCheck is</h2>
      <p>
        VibeCheck estimates how likely an app is to be rejected by Apple&rsquo;s
        App Store review, based on your answers, and (for a fee) writes
        suggested fixes. It is an informational tool. It is{" "}
        <strong>not affiliated with Apple</strong>, and it does{" "}
        <strong>not guarantee</strong> that your app will be approved or
        rejected. The final decision is always Apple&rsquo;s. Nothing here is
        legal advice.
      </p>

      <h2>Accounts</h2>
      <p>
        You only need an account to buy and store fix reports. You are
        responsible for keeping your password safe and for activity under your
        account. Give us accurate information and one real email address.
      </p>

      <h2>Payments</h2>
      <p>
        A fix report costs $5 (US dollars), charged once per report through
        Stripe. Each app you unlock is its own purchase. Prices may change, but
        any change applies only to future purchases.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Don&rsquo;t abuse, overload, or try to break the service.</li>
        <li>Don&rsquo;t scrape, resell, or automate access without permission.</li>
        <li>Don&rsquo;t submit unlawful content or impersonate others.</li>
      </ul>

      <h2>Your content and your report</h2>
      <p>
        You keep ownership of the answers you submit. The fix report we generate
        for you is yours to use for your own app. The VibeCheck site, design, and
        software remain ours.
      </p>

      <h2>No warranty</h2>
      <p>
        The service is provided &ldquo;as is,&rdquo; without warranties of any
        kind. We don&rsquo;t promise the analysis or fixes are complete, correct,
        or that following them will get your app approved.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent the law allows, our total liability to you for any claim
        relating to VibeCheck is limited to the amount you paid us in the 12
        months before the claim. We are not liable for indirect or consequential
        losses, including a rejected or removed app.
      </p>

      <h2>Changes and contact</h2>
      <p>
        We may update these terms; we&rsquo;ll change the date above when we do.
        Questions? Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalLayout>
  );
}
