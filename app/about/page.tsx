import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL, CATEGORIES } from "@/lib/constants";
import AnimateIn from "@/components/AnimateIn";

const PAGE_TITLE = `About ${SITE_NAME} — Trusted Technology News & Analysis`;
const PAGE_DESCRIPTION = `${SITE_NAME} is an independent technology news publication covering AI, startups, cybersecurity, gadgets, and software. Learn about our editorial mission, team, and how we report.`;
const PAGE_URL = `${SITE_URL}/about`;

export const metadata: Metadata = {
  title: `About Us`,
  description: PAGE_DESCRIPTION,
  keywords: [
    `about ${SITE_NAME}`,
    "technology news publication",
    "tech editorial team",
    "AI news source",
    "independent tech journalism",
    "trusted technology news",
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

export default function AboutPage() {
  // AI-search & SEO: rich structured data (AboutPage + Organization + FAQPage)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${PAGE_URL}#aboutpage`,
        url: PAGE_URL,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}#website` },
        inLanguage: "en-US",
      },
      {
        "@type": ["Organization", "NewsMediaOrganization"],
        "@id": `${SITE_URL}#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/alpha_tech_logo.png`,
          width: 180,
          height: 60,
        },
        description: PAGE_DESCRIPTION,
        foundingDate: "2024-01-01",
        knowsAbout: [...CATEGORIES],
        areaServed: "Worldwide",
        sameAs: [
          "https://twitter.com/",
          "https://www.linkedin.com/",
          "https://github.com/",
        ],
        ethicsPolicy: `${SITE_URL}/about#ethics`,
        diversityPolicy: `${SITE_URL}/about#values`,
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: `What is ${SITE_NAME}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${SITE_NAME} is an independent digital publication delivering daily technology news, expert analysis, and in-depth reporting on artificial intelligence, startups, cybersecurity, gadgets, and software.`,
            },
          },
          {
            "@type": "Question",
            name: `Who writes for ${SITE_NAME}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Our editorial team is made up of technology journalists, researchers, and industry contributors who specialize in emerging tech, product launches, and market analysis.`,
            },
          },
          {
            "@type": "Question",
            name: `How does ${SITE_NAME} verify its news?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Every story is fact-checked against primary sources, official press releases, company filings, and verified expert commentary before publication. Corrections are issued transparently when needed.`,
            },
          },
          {
            "@type": "Question",
            name: `Is ${SITE_NAME} free to read?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Yes. All articles on ${SITE_NAME} are free to read, with no paywall, and optimized for fast global access.`,
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "About", item: PAGE_URL },
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
              <li className="text-gray-900 font-medium">About</li>
            </ol>
          </nav>

          <header className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 mb-3">
              About Us
            </p>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-gray-900 leading-tight">
              Reporting the Future of Technology
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              {SITE_NAME} is an independent technology news publication covering
              the breakthroughs, companies, and ideas shaping our digital world —
              from artificial intelligence and cybersecurity to startups, gadgets,
              and software.
            </p>
          </header>
        </AnimateIn>

        <article className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-gray-900 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline">
          <AnimateIn>
            <section aria-labelledby="mission">
              <h2 id="mission">Our Mission</h2>
              <p>
                At {SITE_NAME}, our mission is simple: to give readers a clear,
                trustworthy, and timely view of the technology reshaping business,
                culture, and everyday life. We cut through hype, surface signal
                over noise, and explain why each story matters.
              </p>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="what-we-cover">
              <h2 id="what-we-cover">What We Cover</h2>
              <p>
                Our editorial desks focus on the most consequential areas of
                modern technology:
              </p>
              <ul>
                <li>
                  <strong>Artificial Intelligence</strong> — models, research,
                  tools, and the companies building them.
                </li>
                <li>
                  <strong>Startups & Venture</strong> — funding rounds, founder
                  stories, and emerging market trends.
                </li>
                <li>
                  <strong>Cybersecurity</strong> — breaches, vulnerabilities, and
                  the defenders keeping systems safe.
                </li>
                <li>
                  <strong>Gadgets & Hardware</strong> — launches, hands-on
                  reviews, and buying guidance.
                </li>
                <li>
                  <strong>Software & Developer Tools</strong> — frameworks,
                  platforms, and the open-source ecosystem.
                </li>
              </ul>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="values" id="values">
              <h2 id="values">Our Editorial Values</h2>
              <p>
                We believe great technology journalism is grounded in
                independence, accuracy, and clarity. Every piece we publish is
                guided by a commitment to:
              </p>
              <ul>
                <li>
                  <strong>Accuracy:</strong> Claims are verified against primary
                  sources and on-the-record experts.
                </li>
                <li>
                  <strong>Independence:</strong> Our reporting is not influenced
                  by advertisers, sponsors, or the companies we cover.
                </li>
                <li>
                  <strong>Transparency:</strong> We disclose sources where
                  appropriate and clearly label analysis, opinion, and sponsored
                  content.
                </li>
                <li>
                  <strong>Accessibility:</strong> We write in plain language, so
                  that complex technology is understandable to everyone.
                </li>
              </ul>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="ethics" id="ethics">
              <h2 id="ethics">Editorial & Ethics Policy</h2>
              <p>
                {SITE_NAME} follows a strict editorial ethics policy. Corrections
                are issued promptly and transparently. Conflicts of interest are
                disclosed. Sponsored content is always clearly marked and never
                mixed with independent reporting.
              </p>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="ai-usage">
              <h2 id="ai-usage">Our Use of AI</h2>
              <p>
                We embrace AI as a research and productivity tool, but every
                published article is written, reviewed, and fact-checked by
                humans. We do not publish AI-generated stories without editorial
                oversight.
              </p>
            </section>
          </AnimateIn>

          <AnimateIn>
            <section aria-labelledby="contact">
              <h2 id="contact">Contact the Newsroom</h2>
              <p>
                Story tips, press releases, and feedback are always welcome.
                Reach our editorial team through the channels linked in the
                footer. For privacy and data requests, see our{" "}
                <Link href="/privacy">Privacy Policy</Link>.
              </p>
            </section>
          </AnimateIn>
        </article>
      </div>
    </>
  );
}
