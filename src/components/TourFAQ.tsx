'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ } from '@/lib/types';

interface Props {
  faq: FAQ[];
}

export default function TourFAQ({ faq }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-2">
      {faq.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 text-sm sm:text-base pr-4 leading-snug">
                {item.question}
              </span>
              <span className={`flex-shrink-0 text-gray-400 transition-transform duration-200 inline-flex ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                <ChevronDown size={18} />
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
            >
              <div className="px-4 pb-4 pt-3 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-white">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}