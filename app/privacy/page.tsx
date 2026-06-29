import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = { title: "Privacy Policy · VibeCheck" };

const CONTACT = "support@vibecheckhq.app";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 28, 2026">
      <p>
        This policy explains what VibeCheck collects, why, and what control you
        have over it. We try to collect as little as possible.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your answers.</strong> The six questionnaire answers you
          submit, including the free-text description of what your app does. This
          is the input we analyze.
        </li>
        <li>
          <strong>Account email.</strong> If you buy a fix report, we store the
          email and password you register. Passwords are handled by our auth
          provider and are never stored by us in readable form.
        </li>
        <li>
          <strong>Payment details.</strong> Payments are processed by Stripe.
          Your card number never touches our servers. We store only a payment
          reference so we can confirm a purchase.
        </li>
        <li>
          <strong>Your reports.</strong> The diagnosis and the fix report tied to
          your account, so you can reopen them later.
        </li>
        <li>
          <strong>Limited technical data.</strong> A truncated IP address and
          timestamps, used only to rate-limit abuse and keep the service up.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To generate your risk diagnosis and, if you pay, your fix report.</li>
        <li>To run your account and show you your purchased reports.</li>
        <li>To prevent abuse and keep the service available.</li>
      </ul>
      <p>
        We do not sell your data, and we do not use your answers to train any
        model.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We use a small set of processors to run the service. They only receive
        what they need:
      </p>
      <ul>
        <li>
          <strong>Anthropic</strong> receives your answers to generate the
          analysis.
        </li>
        <li>
          <strong>Stripe</strong> processes your payment.
        </li>
        <li>
          <strong>Supabase</strong> stores your account and reports;{" "}
          <strong>Vercel</strong> hosts the site; <strong>Upstash</strong>{" "}
          handles rate limiting.
        </li>
      </ul>

      <h2>Keeping and deleting your data</h2>
      <p>
        Free checks are stateless: nothing is saved unless you create an account
        and buy a report. Reports stay in your account until you ask us to remove
        them. To delete your account and everything tied to it, email{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a> and we will remove it.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live (for example under GDPR or CCPA), you can ask
        us to show you the data we hold about you, correct it, delete it, or
        export it, and you can object to certain processing. We do not sell your
        personal information. To exercise any of these, email{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a> from your account address and
        we will respond within a reasonable time.
      </p>
      <p>
        Our processors may handle data in countries other than yours. We only use
        providers that offer appropriate safeguards for that transfer.
      </p>

      <h2>Children</h2>
      <p>VibeCheck is for developers and is not directed at children under 13.</p>

      <h2>Changes</h2>
      <p>
        If we change this policy we will update the date above. Continued use
        after a change means you accept the update.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Email{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalLayout>
  );
}
