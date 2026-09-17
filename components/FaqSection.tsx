"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How long does delivery take?",
      answer: "We usually deliver within 24 to 48 hours inside Dhaka city, and 2-3 days outside Dhaka.",
    },
    {
      question: "Are your products 100% organic?",
      answer: "Yes, all our grocery items, sugar, and organic products are sourced directly from trusted natural farms.",
    },
    {
      question: "What is your return policy?",
      answer: "If you receive any damaged or defective product, you can return it to our delivery man instantly or request a replacement within 24 hours.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Cash on Delivery (COD), bKash, Nagad, and all major debit/credit cards via online checkout.",
    },
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 my-12">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Frequently Asked Questions</h2>
      <p className="text-sm text-gray-500 text-center mb-8">Got questions? We've got answers.</p>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full px-5 py-4 text-left font-semibold text-gray-800 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <span>{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-green-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
