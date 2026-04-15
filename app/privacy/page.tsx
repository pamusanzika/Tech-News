import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import AnimateIn from "@/components/AnimateIn";

const PAGE_TITLE = `Privacy Policy — ${SITE_NAME}`;
const PAGE_DESCRIPTION = `Read the ${SITE_NAME} Privacy Policy to understand what personal information we collect, how we use cookies and analytics, your rights under GDPR and CCPA, and how to contact us about your data.`;
const PAGE_URL = `${SITE_URL}/privacy`;
const LAST_UPDATED = "April 11, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: PAGE_DESCRIPTION,
  keywords: [
    `${SITE_NAME} privacy policy`,
    "technology news privacy",
    "GDPR",
    "CCPA",
    "cookie policy",
    "data protection",
    "user privacy rights",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName: SITE_NAME,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [
      {
        url: "/Og_image.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ["/Og_image.png"],
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  // SEO + AI-search structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}#website` },
        inLanguage: "en-US",
        dateModified: "2026-04-11",
        about: {
          "@type": "Thing",
          name: "Privacy Policy, data protection, cookies, GDPR, CCPA",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Privacy Policy", item: PAGE_URL },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: `What personal data does ${SITE_NAME} collect?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${SITE_NAME} collects limited technical data such as IP address, browser type, device type, and pages visited through cookies and analytics. We do not sell personal information.`,
            },
          },
          {
            "@type": "Question",
            name: "Does this site use cookies?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Yes. We use essential cookies to operate the site and optional analytics cookies to understand how readers use our content. You can disable non-essential cookies at any time through your browser settings.`,
            },
          },
          {
            "@type": "Question",
            name: "What are my privacy rights under GDPR and CCPA?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Depending on where you live, you may have the right to access, correct, delete, or port your personal information, and to opt out of certain data uses. Contact us to exercise these rights.`,
            },
          },
          {
            "@type": "Question",
            name: `Does ${SITE_NAME} sell personal information?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `No. ${SITE_NAME} does not sell personal information to third parties.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimateIn>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-brand-600 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-900 font-medium">Privacy Policy</li>
            </ol>
          </nav>

          <header className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 mb-3">
              Legal
            </p>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-gray-900 leading-tight">
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm text-gray-500">
              Last updated: <time dateTime="2026-04-11">{LAST_UPDATED}</time>
            </p>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              This Privacy Policy explains how {SITE_NAME} (&quot;we&quot;, &quot;us&quot;, or
              &quot;our&quot;) collects, uses, and protects information when you visit our
              website. We value your privacy and are committed to handling your
              data transparently and responsibly.
            </p>
          </header>
        </AnimateIn>

        <article className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-gray-900 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline">
          <AnimateIn>
            <section aria-labelledby="info-we-collect">
              <h2 id="info-we-collect">1. Information We Collect</h2>
              <p>
                When you visit {SITE_NAME}, we may automatically collect limited
                technical information, including:
              </p>
              <ul>
                <li>IP address and approximate geographic location</li>
                <li>Browser type, operating system, and device information</li>
                <li>Referring URL and pages you visit on our site</li>
                <li>Date, time, and duration of your visit</li>
              </ul>
              <p>
                If you contact us directly (for example, to submit a news tip),
                we may also collect your name, email address, and any
                information you choose to share.
              </p>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="how-we-use">
              <h2 id="how-we-use">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Operate, maintain, and improve our website</li>
                <li>Understand how readers engage with our articles</li>
                <li>Protect the site from abuse, fraud, and security threats</li>
                <li>Respond to inquiries and editorial tips</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="cookies">
              <h2 id="cookies">3. Cookies & Analytics</h2>
              <p>
                {SITE_NAME} uses cookies and similar technologies to remember
                your preferences and measure site performance. We may use
                privacy-respecting analytics tools to understand aggregate
                traffic patterns. You can disable non-essential cookies at any
                time through your browser settings.
              </p>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="sharing">
              <h2 id="sharing">4. How We Share Information</h2>
              <p>
                We do <strong>not</strong> sell your personal information. We
                may share limited data with trusted service providers (such as
                hosting, analytics, and security vendors) strictly to operate
                the site, or when required by law.
              </p>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="third-party">
              <h2 id="third-party">5. Third-Party Links</h2>
              <p>
                Our articles may link to third-party websites. We are not
                responsible for the privacy practices of those sites. We
                encourage you to review their privacy policies before sharing
                personal information.
              </p>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="your-rights">
              <h2 id="your-rights">6. Your Privacy Rights (GDPR & CCPA)</h2>
              <p>
                Depending on your location, you may have the right to:
              </p>
              <ul>
                <li>Access the personal data we hold about you</li>
                <li>Request correction or deletion of your data</li>
                <li>Object to or restrict certain processing</li>
                <li>Request a portable copy of your data</li>
                <li>Opt out of the sale or sharing of personal information</li>
                <li>Lodge a complaint with a data protection authority</li>
              </ul>
              <p>
                To exercise any of these rights, contact us using the details in
                the section below.
              </p>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="retention">
              <h2 id="retention">7. Data Retention</h2>
              <p>
                We keep personal information only for as long as necessary to
                fulfill the purposes described in this policy, comply with
                legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="security">
              <h2 id="security">8. Security</h2>
              <p>
                We use industry-standard safeguards — including encrypted
                connections (HTTPS) and secure hosting infrastructure — to
                protect information we collect. No method of transmission over
                the internet is 100% secure, but we work to protect your data
                using reasonable means.
              </p>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="children">
              <h2 id="children">9. Children&apos;s Privacy</h2>
              <p>
                {SITE_NAME} is not directed to children under the age of 13 and
                we do not knowingly collect personal information from children.
                If you believe a child has provided us with personal data,
                please contact us so we can remove it.
              </p>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="changes">
              <h2 id="changes">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. When we do,
                we will revise the &quot;Last updated&quot; date at the top of this page.
                Material changes will be communicated clearly on our website.
              </p>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="contact">
              <h2 id="contact">11. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or wish to
                exercise your rights, please reach out via the channels listed
                on our{" "}
                <Link href="/about">About page</Link>. We aim to respond to all
                valid requests within 30 days.
              </p>
            </section>
          </AnimateIn>
        </article>
      </div>
    </>
  );
}
