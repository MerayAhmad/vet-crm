import React, { useState } from 'react';
import { 
  PhoneCall, 
  Plus, 
  Check, 
  Clock, 
  AlertCircle, 
  MessageCircle, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  X,
  Filter,
  User
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { FollowUp, FollowUpStatus } from '../types';
import { 
  formatDateArabic, 
  formatRelativeDate, 
  createWhatsAppUrl, 
  createPhoneUrl, 
  FOLLOWUP_TYPE_MAP 
} from '../utils/helpers';

interface FollowUpsProps {
  onOpenNewFollowUp: () => void;
  onSelectCustomer: (customerId: string) => void;
}

export const FollowUps: React.FC<FollowUpsProps> = ({
  onOpenNewFollowUp,
  onSelectCustomer,
}) => {
  const { followUps, completeFollowUp, cancelFollowUp, customers, products, opportunities, users } = useCrm();

  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'overdue' | 'upcoming' | 'completed'>('all');
  const [completeModalItem, setCompleteModalItem] = useState<FollowUp | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Filtering follow-ups
  const filteredFollowUps = followUps.filter((f) => {
    if (activeTab === 'completed') {
      return f.status === 'completed';
    }
    // Only pending for active tabs
    if (f.status !== 'pending') return false;

    const rel = formatRelativeDate(f.dueDate);
    if (activeTab === 'today') return rel.status === 'today';
    if (activeTab === 'overdue') return rel.status === 'overdue';
    if (activeTab === 'upcoming') return rel.status === 'upcoming';
    return true; // 'all' pending
  });

  // Group pending followups into categories for the unified 'all' view
  const overdueItems = followUps.filter((f) => f.status === 'pending' && formatRelativeDate(f.dueDate).status === 'overdue');
  const todayItems = followUps.filter((f) => f.status === 'pending' && formatRelativeDate(f.dueDate).status === 'today');
  const upcomingItems = followUps.filter((f) => f.status === 'pending' && formatRelativeDate(f.dueDate).status === 'upcoming');
  const completedItems = followUps.filter((f) => f.status === 'completed');

  const handleConfirmCompletion = () => {
    if (completeModalItem) {
      completeFollowUp(completeModalItem.id, completionNotes.trim());
      setCompleteModalItem(null);
      setCompletionNotes('');
    }
  };

  const renderFollowUpCard = (flw: FollowUp) => {
    const cust = customers.find((c) => c.id === flw.customerId);
    const opp = opportunities.find((o) => o.id === flw.opportunityId);
    const prod = products.find((p) => p.id === opp?.productId);
    const assigned = users.find((u) => u.id === flw.assignedTo);
    const rel = formatRelativeDate(flw.dueDate);
    const isOverdue = rel.status === 'overdue';
    const isToday = rel.status === 'today';
    const isCompleted = flw.status === 'completed';
    const typeObj = FOLLOWUP_TYPE_MAP[flw.type] || FOLLOWUP_TYPE_MAP.other;

    return (
      <div
        key={flw.id}
        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isCompleted
            ? 'bg-slate-50/70 border-slate-200 opacity-80'
            : isOverdue
            ? 'bg-rose-50/40 border-rose-200 shadow-xs'
            : isToday
            ? 'bg-amber-50/40 border-amber-200 shadow-xs'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="space-y-1.5 flex-1">
          {/* Header Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => cust && onSelectCustomer(cust.id)}
              className="text-base font-bold text-slate-900 hover:text-emerald-700 text-right transition-colors"
            >
              {cust?.name || 'عميل'}
            </button>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {typeObj.ar}
            </span>
            {prod && (
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                💊 {prod.name}
              </span>
            )}
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800'
                  : isOverdue
                  ? 'bg-rose-100 text-rose-700'
                  : isToday
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isCompleted ? '✓ مكتملة' : `${rel.label} ${flw.dueTime}`}
            </span>
          </div>

          {/* Notes description */}
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            {flw.notes}
          </p>

          {/* Completion info if completed */}
          {isCompleted && flw.completionNotes && (
            <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100 inline-block">
              ✓ نتيجة المتابعة: {flw.completionNotes}
            </div>
          )}

          {/* Subtext info */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
            <span>المسؤول: {assigned?.name || 'موظف'}</span>
            <span>·</span>
            <span>المدينة: {cust?.city || 'دمشق'}</span>
            {cust?.phone && (
              <>
                <span>·</span>
                <span className="font-mono dir-ltr">{cust.phone}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!isCompleted && (
          <div className="flex items-center gap-2 shrink-0">
            {cust && (
              <>
                <a
                  href={createWhatsAppUrl(cust.phone, cust.name, prod?.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={createPhoneUrl(cust.phone)}
                  className="h-9 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال</span>
                </a>
              </>
            )}
            <button
              onClick={() => {
                setCompleteModalItem(flw);
                setCompletionNotes('');
              }}
              className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>تمّت المتابعة</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>جدول المتابعات والاتصالات</span>
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
              {todayItems.length} اليوم · {overdueItems.length} متأخرة
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            متابعة العملاء عبر WhatsApp والهاتف والزيارات الميدانية
          </p>
        </div>

        <button
          onClick={onOpenNewFollowUp}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ جدولة متابعة جديدة</span>
        </button>
      </div>

      {/* 2. Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-xs text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          الكل المعلق ({followUps.filter((f) => f.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'overdue'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <span>🔴 متأخرة</span>
          <span className="font-mono">({overdueItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'today'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-800 hover:bg-amber-50'
          }`}
        >
          <span>🟡 اليوم</span>
          <span className="font-mono">({todayItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-blue-700 hover:bg-blue-50'
          }`}
        >
          <span>🟢 القادمة</span>
          <span className="font-mono">({upcomingItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>✓ المكتملة</span>
          <span className="font-mono">({completedItems.length})</span>
        </button>
      </div>

      {/* 3. Follow-up Cards List */}
      <div className="space-y-4">
        {activeTab === 'all' ? (
          <>
            {/* Overdue Section */}
            {overdueItems.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  <span>المتابعات المتأخرة ({overdueItems.length})</span>
                </div>
                {overdueItems.map(renderFollowUpCard)}
              </div>
            )}

            {/* Today Section */}
            {todayItems.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>متابعات اليوم ({todayItems.length})</span>
                </div>
                {todayItems.map(renderFollowUpCard)}
              </div>
            )}

            {/* Upcoming Section */}
            {upcomingItems.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>المتابعات القادمة ({upcomingItems.length})</span>
                </div>
                {upcomingItems.map(renderFollowUpCard)}
              </div>
            )}

            {overdueItems.length === 0 && todayItems.length === 0 && upcomingItems.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                لا توجد أي متابعات معلقة حالياً.
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2.5">
            {filteredFollowUps.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                لا توجد متابعات في هذا القسم.
              </div>
            ) : (
              filteredFollowUps.map(renderFollowUpCard)
            )}
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {completeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                تسجيل إنجاز المتابعة
              </h3>
              <button
                onClick={() => setCompleteModalItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600">
              اكتب نتيجة التواصل مع العميل، وسيتم تسجيلها فوراً في سجل النشاط الزمني (Timeline):
            </p>

            <textarea
              rows={3}
              placeholder="مثال: تم الاتصال، العميل وافق على عرض السعر وسيقوم بالتحويل غداً..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              autoFocus
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCompleteModalItem(null)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmCompletion}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
              >
                تأكيد الإنجاز ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
