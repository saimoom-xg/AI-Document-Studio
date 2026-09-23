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
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {definition.label} Layouts
          </h3>
          <p className="text-[11px] text-slate-500">
            Select a structural layout for this document.
          </p>
        </div>
        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
          {definition.templates.length} layouts
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
                  ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </span>
              )}

              {/* Wireframe Mini Sheet Representation */}
              <div className="aspect-[3/4] w-full rounded-md border border-slate-200 bg-white p-2 shadow-2xs flex flex-col justify-between overflow-hidden">
                <TemplateWireframe templateId={tpl.id} accentColor={tpl.accentColor} docType={definition.type} />
              </div>

              {/* Title & Description */}
              <div className="mt-2">
                <p className="text-xs font-bold text-slate-900 truncate">{tpl.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{tpl.category} Layout</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TemplateWireframe({
  templateId,
  accentColor,
  docType,
}: {
  templateId: string;
  accentColor: string;
  docType: string;
}) {
  // 1. Corporate Left Sidebar
  if (templateId === 'Corporate' && docType === 'cv') {
    return (
      <div className="h-full flex gap-1.5">
        <div className="w-1/3 h-full rounded-xs p-1 flex flex-col justify-between" style={{ backgroundColor: accentColor }}>
          <div className="space-y-1">
            <div className="h-1 w-full bg-white/90 rounded-2xs" />
            <div className="h-0.5 w-3/4 bg-white/60 rounded-2xs" />
          </div>
          <div className="space-y-0.5">
            <div className="h-0.5 w-full bg-white/50 rounded-2xs" />
            <div className="h-0.5 w-2/3 bg-white/50 rounded-2xs" />
          </div>
        </div>
        <div className="w-2/3 h-full flex flex-col justify-between py-1">
          <div className="space-y-1">
            <div className="h-1 w-3/4 bg-slate-300 rounded-2xs" />
            <div className="h-0.5 w-full bg-slate-200 rounded-2xs" />
            <div className="h-0.5 w-4/5 bg-slate-200 rounded-2xs" />
          </div>
          <div className="space-y-0.5">
            <div className="h-0.5 w-full bg-slate-200 rounded-2xs" />
            <div className="h-0.5 w-1/2 bg-slate-200 rounded-2xs" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Minimal Swiss: 28/72 strict grid wireframe
  if (templateId === 'Minimal') {
    return (
      <div className="h-full flex flex-col justify-between">
        <div className="border-b border-black pb-1">
          <div className="h-1 w-12 bg-black rounded-2xs" />
          <div className="h-0.5 w-8 bg-slate-400 rounded-2xs mt-0.5" />
        </div>
        <div className="space-y-1.5">
          <div className="flex gap-1.5 items-baseline">
            <div className="h-0.5 w-5 bg-black rounded-2xs" />
            <div className="h-0.5 flex-1 bg-slate-200 rounded-2xs" />
          </div>
          <div className="flex gap-1.5 items-baseline">
            <div className="h-0.5 w-5 bg-black rounded-2xs" />
            <div className="h-0.5 flex-1 bg-slate-200 rounded-2xs" />
          </div>
          <div className="flex gap-1.5 items-baseline">
            <div className="h-0.5 w-5 bg-black rounded-2xs" />
            <div className="h-0.5 flex-1 bg-slate-200 rounded-2xs" />
          </div>
        </div>
        <div className="h-0.5 w-full bg-slate-200 rounded-2xs" />
      </div>
    );
  }

  // 3. Professional: Centered title with horizontal divider lines
  if (templateId === 'Professional') {
    return (
      <div className="h-full flex flex-col justify-between py-1">
        <div className="text-center space-y-1 border-b pb-1 border-slate-300">
          <div className="h-1 w-10 bg-slate-900 mx-auto rounded-2xs" />
          <div className="h-0.5 w-14 bg-slate-400 mx-auto rounded-2xs" />
        </div>
        <div className="space-y-1">
          <div className="h-0.5 w-full bg-slate-300 rounded-2xs" />
          <div className="h-0.5 w-5/6 bg-slate-200 rounded-2xs" />
        </div>
        <div className="space-y-1 border-t border-slate-200 pt-1">
          <div className="h-0.5 w-full bg-slate-200 rounded-2xs" />
          <div className="h-0.5 w-3/4 bg-slate-200 rounded-2xs" />
        </div>
      </div>
    );
  }

  // 4. Retail Receipt with barcode
  if (templateId === 'Retail' || docType === 'receipt') {
    return (
      <div className="h-full flex flex-col justify-between text-center p-0.5 font-mono">
        <div className="border-b border-dashed border-slate-300 pb-1">
          <div className="h-1 w-8 bg-slate-800 mx-auto rounded-2xs" />
          <div className="h-0.5 w-12 bg-slate-300 mx-auto mt-0.5 rounded-2xs" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <div className="h-0.5 w-6 bg-slate-400 rounded-2xs" />
            <div className="h-0.5 w-3 bg-slate-400 rounded-2xs" />
          </div>
          <div className="flex justify-between">
            <div className="h-0.5 w-8 bg-slate-300 rounded-2xs" />
            <div className="h-0.5 w-4 bg-slate-300 rounded-2xs" />
          </div>
        </div>
        <div className="border-t border-dashed border-slate-300 pt-1">
          <div className="flex justify-between">
            <div className="h-0.5 w-4 bg-slate-800 rounded-2xs" />
            <div className="h-0.5 w-5 bg-slate-800 rounded-2xs" />
          </div>
          {/* Barcode line pattern */}
          <div className="h-2 w-12 bg-slate-300 mx-auto mt-1 flex justify-center gap-0.5 overflow-hidden">
            <div className="h-full w-0.5 bg-black" />
            <div className="h-full w-1 bg-black" />
            <div className="h-full w-0.5 bg-black" />
          </div>
        </div>
      </div>
    );
  }

  // 5. Classic / Double Rule
  if (templateId === 'Classic') {
    return (
      <div className="h-full flex flex-col justify-between py-1">
        <div className="border-b-2 border-double border-slate-900 pb-1 text-center">
          <div className="h-1 w-12 bg-slate-900 mx-auto rounded-2xs" />
        </div>
        <div className="space-y-1">
          <div className="h-0.5 w-full bg-slate-300 rounded-2xs" />
          <div className="h-0.5 w-4/5 bg-slate-200 rounded-2xs" />
        </div>
        <div className="border-t-2 border-double border-slate-900 pt-1 flex justify-end">
          <div className="h-1 w-6 bg-slate-900 rounded-2xs" />
        </div>
      </div>
    );
  }

  // Default / Modern
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-1">
        <div className="h-1.5 w-full rounded-2xs" style={{ backgroundColor: accentColor }} />
        <div className="flex justify-between items-center pt-0.5">
          <div className="h-1 w-10 rounded-2xs bg-slate-300" />
          <div className="h-1 w-6 rounded-2xs bg-slate-200" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="h-0.5 w-full bg-slate-200 rounded-2xs" />
        <div className="h-0.5 w-4/5 bg-slate-200 rounded-2xs" />
        <div className="h-0.5 w-3/4 bg-slate-200 rounded-2xs" />
      </div>
      <div className="h-1 w-full bg-slate-100 rounded-2xs" />
    </div>
  );
}
