import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = { title: "Refund Policy — VibeCheck" };

const CONTACT = "support@vibecheckhq.app";

export default function RefundPage() {
  return (
    <LegalLayout title="Refund Policy" updated="June 28, 2026">
      <p>
        A fix report is a digital product generated and delivered the moment you
        pay. This policy explains when we refund.
      </p>

      <h2>We refund if the report fails</h2>
      <p>
        If your payment goes through but the fix report doesn&rsquo;t generate,
        you owe nothing. The report is built to retry itself, but if it still
        won&rsquo;t appear, email us and we&rsquo;ll either fix it or refund the
        $5 in full.
      </p>

      <h2>Change of mind</h2>
      <p>
        Because the report is delivered instantly and is specific to your app, we
        generally don&rsquo;t refund a completed report for change of mind. That
        said, if you think the report missed the mark, tell us. We read every
        message and would rather make it right than leave you unhappy.
      </p>

      <h2>How to request a refund</h2>
      <p>
        Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> within 14 days of your
        purchase, from the address on your account, and tell us what went wrong.
        Refunds are issued to your original payment method through Stripe.
      </p>
    </LegalLayout>
  );
}
