"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "What\u2019s the difference between Library and Full Access?",
    answer:
      "Library ($12/year) gives you full access to every deal structure, case study, framework, and guide in the content library. Full Access ($19/month or $190/year) includes everything in Library plus AI-powered tools: the Strategic Advisor, Deal Evaluator, Career Assessment, and Asset Inventory.",
  },
  {
    question: "What\u2019s included in the Library?",
    answer:
      "35+ deal structures with negotiation scripts and templates, 70+ case studies across creative industries, decision frameworks, strategic roadmaps, and all new content added weekly.",
  },
  {
    question: "What are the AI tools in Full Access?",
    answer:
      "Full Access includes four AI-powered tools: (1) Strategic Advisor \u2014 personalized guidance on your specific career and deal situations, (2) Deal Evaluator \u2014 score and analyze any deal you\u2019re considering, (3) Career Assessment \u2014 map your current position and get a custom roadmap, and (4) Asset Inventory \u2014 track and value your creative assets over time.",
  },
  {
    question: "Can I upgrade from Library to Full Access later?",
    answer:
      "Yes. You can upgrade at any time from your account settings. When you upgrade, you\u2019ll get immediate access to all AI tools and your Library access continues uninterrupted.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel your membership at any time from your account settings. You\u2019ll retain access through the end of your current billing period.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "We don\u2019t offer a free trial, but you can explore free public previews of select structures and case studies on the Resources page. Library access starts at $12/year \u2014 about $1 a month.",
  },
  {
    question: "Do you offer student pricing?",
    answer:
      "We\u2019re building a university program that will offer free Library access to enrolled students. Contact us at insequence@gmail.com if you\u2019re a student or educator interested in early access.",
  },
  {
    question: "What\u2019s the 1:1 Coaching tier?",
    answer:
      "1:1 Coaching ($5,000/month) includes everything in Full Access plus a dedicated strategic advisor. Engagements run 3, 6, or 9 months depending on your goals. This tier is currently waitlist-only \u2014 apply on the pricing page.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div className="pr-faq-list">
      {faqItems.map((item, i) => {
        const isOpen = openIndex === i;
        const delayClass = i > 0 ? `rv-d${i}` : "";
        return (
          <div
            key={i}
            className={`pr-faq-item${isOpen ? " open" : ""}`}
          >
            <button
              className="pr-faq-q"
              aria-expanded={isOpen}
              onClick={() => toggle(i)}
              data-cursor="expand"
            >
              <span>{item.question}</span>
              <span className="pr-faq-icon">+</span>
            </button>
            <div className="pr-faq-a">
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
