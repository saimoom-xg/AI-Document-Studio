'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { DocumentDefinition, DocumentTemplateMeta } from '@/lib/documents/types';

interface TemplatePickerProps {
  definition: DocumentDefinition;
  selectedTemplateId: string;
  onSelect: (templateId: string) => void;
}

export default function TemplatePicker({
  definition,
  selectedTemplateId,
  onSelect,
}: TemplatePickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {definition.label} Templates
          </h3>
          <p className="text-xs text-slate-500">
            Choose a visual style. Your data is preserved across templates.
          </p>
        </div>
        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
          {definition.templates.length} styles
        </span>
      </div>

      {/* Grid of mini template cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {definition.templates.map((tpl) => {
          const isSelected = tpl.id === selectedTemplateId;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelect(tpl.id)}
              className={`group text-left rounded-xl p-2.5 border transition-all duration-150 relative ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </span>
              )}

              {/* Mini Sheet Thumbnail */}
              <div className="aspect-[3/4] w-full rounded-md border border-slate-200 bg-white p-2 shadow-xs flex flex-col justify-between overflow-hidden">
                {/* Header line with accent color */}
                <div className="space-y-1">
                  <div
                    className="h-1.5 w-full rounded-xs"
                    style={{ backgroundColor: tpl.accentColor }}
                  />
                  <div className="flex justify-between items-center pt-0.5">
                    <div className="h-1 w-10 rounded-xs bg-slate-300" />
                    <div className="h-1 w-6 rounded-xs bg-slate-200" />
                  </div>
                </div>

                {/* Body skeleton lines */}
                <div className="space-y-1.5 py-1">
                  <div className="space-y-0.5">
                    <div className="h-1 w-8 rounded-xs" style={{ backgroundColor: tpl.accentColor, opacity: 0.7 }} />
                    <div className="h-0.5 w-full rounded-xs bg-slate-200" />
                    <div className="h-0.5 w-4/5 rounded-xs bg-slate-200" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="h-1 w-7 rounded-xs" style={{ backgroundColor: tpl.accentColor, opacity: 0.7 }} />
                    <div className="h-0.5 w-full rounded-xs bg-slate-200" />
                    <div className="h-0.5 w-3/4 rounded-xs bg-slate-200" />
                  </div>
                </div>

                {/* Footer bar */}
                <div className="h-0.5 w-full rounded-xs bg-slate-200" />
              </div>

              {/* Title & Category */}
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-900 truncate">{tpl.name}</p>
                <p className="text-[10px] text-slate-600 truncate">{tpl.category}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
