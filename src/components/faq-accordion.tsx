"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "What's included in the membership?",
    answer:
      "Full access to the complete In Sequence library: 35+ deal structures with negotiation scripts and templates, 50+ case studies across creative industries, decision frameworks, strategic roadmaps, and all new content added weekly.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel your membership at any time from your account settings. You\u2019ll retain access through the end of your current billing period.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "We don\u2019t offer a free trial, but you can explore free public previews of select structures and case studies on the Resources page. The full library is $89/year \u2014 less than $7.50 a month.",
  },
  {
    question: "Do you offer student pricing?",
    answer:
      "We\u2019re building a university program that will offer free access to enrolled students. Contact us at insequence@gmail.com if you\u2019re a student or educator interested in early access.",
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
            className={`pr-faq-item rv${delayClass ? ` ${delayClass}` : ""}${isOpen ? " open" : ""}`}
          >
            <button
              className="pr-faq-q"
              aria-expanded={isOpen}
              onClick={() => toggle(i)}
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
