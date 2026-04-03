'use client';

import { useState } from 'react';
import { ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import { EquipmentSection } from '@/lib/types';

interface Props {
  equipment: EquipmentSection[];
}

export default function TourEquipment({ equipment }: Props) {
  // Храним открытые секции как массив индексов
  const [openIdxs, setOpenIdxs] = useState<number[]>([0]);

  const toggle = (idx: number) => {
    setOpenIdxs((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="space-y-2">
      {equipment.map((section, idx) => {
        const isOpen = openIdxs.includes(idx);
        return (
          <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{section.title}</span>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                  {section.items.length}
                </span>
              </div>
              <span className={`flex-shrink-0 text-gray-400 transition-transform duration-200 inline-flex ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                <ChevronDown size={18} />
              </span>
            </button>

            <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[800px]' : 'max-h-0'}`}>
              <div className="border-t border-gray-100 bg-white">
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-4 py-3 ${i < section.items.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    {item.required ? (
                      <CheckCircle2 size={16} className="text-[#E03C31] flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle size={16} className="text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${item.required ? 'text-gray-900' : 'text-gray-500'}`}>
                        {item.name}
                      </span>
                      {item.note && (
                        <span className="text-xs text-gray-400 ml-1.5">({item.note})</span>
                      )}
                    </div>
                    {!item.required && (
                      <span className="text-xs text-gray-400 flex-shrink-0 bg-gray-100 rounded px-1.5 py-0.5">
                        по желанию
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <p className="text-xs text-gray-400 pt-1 flex items-center gap-3">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={13} className="text-[#E03C31]" /> обязательно
        </span>
        <span className="flex items-center gap-1">
          <Circle size={13} className="text-gray-300" /> по желанию
        </span>
      </p>
    </div>
  );
}