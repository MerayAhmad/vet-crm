import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  DollarSign, 
  Clock, 
  Pill, 
  User, 
  CheckCircle, 
  AlertCircle,
  MoreVertical,
  Check
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { Opportunity, OpportunityStage } from '../types';
import { STAGE_MAP, formatCurrency } from '../utils/helpers';

interface PipelineProps {
  onOpenNewOpportunity: () => void;
  onSelectCustomer: (customerId: string) => void;
  onOpenNewFollowUpForCustomer: (customerId: string) => void;
}

export const Pipeline: React.FC<PipelineProps> = ({
  onOpenNewOpportunity,
  onSelectCustomer,
  onOpenNewFollowUpForCustomer,
}) => {
  const { 
    opportunities, 
    updateOpportunityStage, 
    customers, 
    products, 
    users 
  } = useCrm();

  // The 5 Odoo stages
  const stages: { key: OpportunityStage; label: string; headerColor: string }[] = [
    { key: 'new', label: 'جديد', headerColor: 'border-blue-400 bg-blue-50/50 text-blue-900' },
    { key: 'contacted', label: 'تم التواصل', headerColor: 'border-purple-400 bg-purple-50/50 text-purple-900' },
    { key: 'interested', label: 'مهتم', headerColor: 'border-amber-400 bg-amber-50/50 text-amber-900' },
    { key: 'quotation', label: 'طلب عرض سعر', headerColor: 'border-indigo-400 bg-indigo-50/50 text-indigo-900' },
    { key: 'won', label: 'تم البيع بنجاح 🎉', headerColor: 'border-emerald-500 bg-emerald-50/70 text-emerald-900' },
  ];

  // Drag and drop state
  const [draggedOppId, setDraggedOppId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, oppId: string) => {
    setDraggedOppId(oppId);
    e.dataTransfer.setData('text/plain', oppId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: OpportunityStage) => {
    e.preventDefault();
    const oppId = e.dataTransfer.getData('text/plain') || draggedOppId;
    if (oppId) {
      updateOpportunityStage(oppId, targetStage);
    }
    setDraggedOppId(null);
  };

  // Move stage sequentially with quick button
  const handleMoveNext = (opp: Opportunity) => {
    const currentIndex = stages.findIndex((s) => s.key === opp.stage);
    if (currentIndex < stages.length - 1) {
      updateOpportunityStage(opp.id, stages[currentIndex + 1].key);
    }
  };

  const handleMovePrev = (opp: Opportunity) => {
    const currentIndex = stages.findIndex((s) => s.key === opp.stage);
    if (currentIndex > 0) {
      updateOpportunityStage(opp.id, stages[currentIndex - 1].key);
    }
  };

  // Calculate total pipeline value
  const totalPipelineValue = opportunities
    .filter(o => o.stage !== 'lost')
    .reduce((sum, o) => sum + o.expectedValue, 0);

  return (
    <div className="space-y-4 max-w-full">
      {/* 1. Header with Title, Metrics & Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>مسار المبيعات (Pipeline)</span>
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
              إجمالي القيمة: {formatCurrency(totalPipelineValue)}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            سحب وإفلات وتحريك الفرص بين مراحل الشراء والطلبيات البيطرية
          </p>
        </div>

        <button
          onClick={onOpenNewOpportunity}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ فرصة بيع جديدة</span>
        </button>
      </div>

      {/* 2. Odoo Kanban Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start overflow-x-auto pb-4">
        {stages.map((stg) => {
          const stageOpps = opportunities.filter((o) => o.stage === stg.key);
          const stageTotal = stageOpps.reduce((sum, o) => sum + o.expectedValue, 0);

          return (
            <div
              key={stg.key}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stg.key)}
              className="bg-slate-100/80 rounded-2xl border border-slate-200/80 p-3 min-h-[500px] flex flex-col transition-colors"
            >
              {/* Column Header */}
              <div className={`p-2.5 rounded-xl border ${stg.headerColor} mb-3 shadow-xs`}>
                <div className="flex items-center justify-between text-xs font-black">
                  <span>{stg.label}</span>
                  <span className="font-mono bg-white/80 px-2 py-0.5 rounded-md shadow-2xs">
                    {stageOpps.length}
                  </span>
                </div>
                <div className="mt-1 text-[11px] font-mono font-semibold opacity-85 text-left dir-ltr">
                  {formatCurrency(stageTotal)}
                </div>
              </div>

              {/* Cards List in this Stage */}
              <div className="space-y-2.5 flex-1">
                {stageOpps.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                    اسحب الفرصة هنا
                  </div>
                ) : (
                  stageOpps.map((opp) => {
                    const cust = customers.find((c) => c.id === opp.customerId);
                    const prod = products.find((p) => p.id === opp.productId);
                    const assigned = users.find((u) => u.id === opp.assignedTo);
                    const isWon = opp.stage === 'won';

                    return (
                      <div
                        key={opp.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, opp.id)}
                        className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing text-xs space-y-2.5 ${
                          isWon ? 'border-emerald-300 bg-emerald-50/20' : ''
                        }`}
                      >
                        {/* Top: Customer & Expected Value */}
                        <div className="flex items-start justify-between gap-1">
                          <button
                            onClick={() => cust && onSelectCustomer(cust.id)}
                            className="font-black text-slate-900 hover:text-emerald-700 text-right text-xs leading-snug line-clamp-1"
                          >
                            {cust?.name || 'عميل'}
                          </button>
                          <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] whitespace-nowrap shrink-0">
                            {formatCurrency(opp.expectedValue)}
                          </span>
                        </div>

                        {/* Product & Quantity */}
                        <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <Pill className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold truncate text-[11px] text-slate-800">
                            {prod?.name || 'دواء بيطري'}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            ({opp.quantity} عبوة)
                          </span>
                        </div>

                        {/* Title or Notes */}
                        {opp.title && (
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {opp.title}
                          </p>
                        )}

                        {/* Employee & Location */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          <span>{assigned?.name || 'موظف'}</span>
                          <span>{cust?.city}</span>
                        </div>

                        {/* Stage Progression Buttons */}
                        <div className="flex items-center justify-between pt-1">
                          {opp.stage !== 'new' ? (
                            <button
                              onClick={() => handleMovePrev(opp)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                              title="المرحلة السابقة"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <div></div>
                          )}

                          {opp.stage !== 'won' ? (
                            <button
                              onClick={() => handleMoveNext(opp)}
                              className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200 rounded-lg transition-colors"
                            >
                              <span>المرحلة التالية</span>
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>تمت الصفقة</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
