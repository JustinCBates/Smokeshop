import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Frequently asked questions about ${siteConfig.name}.`,
};

const faqs = [
  {
    question: "What age do I need to be to order?",
    answer:
      "You must be 21 years of age or older to order from our store. We require a two-step age verification process: first a self-declaration, then a date of birth + photo ID check before your first order.",
  },
  {
    question: "What delivery areas do you cover?",
    answer:
      "We currently deliver to the Kansas City Metro, St. Louis Metro, Springfield, and Columbia areas in Missouri. Enter your address at checkout to see if you are in a delivery zone.",
  },
  {
    question: "How does in-store pickup work?",
    answer:
      "Select 'Pickup' and choose your preferred location. Place your order and pay online, then visit the store to collect your items. You will need to present a valid ID at pickup.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept cryptocurrency payments including Bitcoin, Ethereum, and stablecoins.",
  },
  {
    question: "Can cannabis flower be delivered?",
    answer:
      "Cannabis flower and certain regulated products are available for in-store pickup only due to state regulations. These items are clearly marked as 'Pickup Only' in our shop.",
  },
  {
    question: "What are your delivery speeds?",
    answer:
      "We offer Express (within 1 hour), Same Day (within 4 hours), and Next Day delivery depending on your region. Delivery fees vary by speed -- see checkout for exact pricing.",
  },
  {
    question: "How do I become a regional partner?",
    answer:
      "We are always looking for partners to help us serve new areas. Contact us at info@genericsmokeshop.com to learn about our partner program.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Due to the nature of our products, we generally cannot accept returns on opened items. Unopened items can be returned within 14 days of purchase. Defective products are replaced at no charge.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Find answers to common questions about our products and services.
        </p>
      </div>

      <div className="mt-12 space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group rounded-xl border border-border bg-card"
          >
            <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-foreground [&::-webkit-details-marker]:hidden">
              {faq.question}
              <span className="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="px-5 pb-5">
              <p className="leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
