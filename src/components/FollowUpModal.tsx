import React, { useState } from 'react';
import { X, Check, Clock, Phone, Calendar, User } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { FollowUpType } from '../types';
import { FOLLOWUP_TYPE_MAP } from '../utils/helpers';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  defaultCustomerId,
}) => {
  const { customers, opportunities, users, currentUser, addFollowUp } = useCrm();

  const [customerId, setCustomerId] = useState(defaultCustomerId || customers[0]?.id || '');
  const [opportunityId, setOpportunityId] = useState('');
  const [type, setType] = useState<FollowUpType>('call');
  const [dueDate, setDueDate] = useState('2026-10-06'); // Tomorrow as default
  const [dueTime, setDueTime] = useState('11:00');
  const [assignedTo, setAssignedTo] = useState(currentUser.id);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Filter opportunities related to this customer
  const customerOpportunities = opportunities.filter((o) => o.customerId === customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError('يرجى اختيار العميل');
      return;
    }
    if (!notes.trim()) {
      setError('يرجى كتابة ملاحظة أو هدف المتابعة');
      return;
    }

    addFollowUp({
      customerId,
      opportunityId: opportunityId || undefined,
      assignedTo,
      type,
      dueDate,
      dueTime,
      status: 'pending',
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-900">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold">جدولة متابعة بيطرية جديدة</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs md:text-sm">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Customer */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              العميل <span className="text-rose-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setOpportunityId('');
              }}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city} - {c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Optional Opportunity */}
          {customerOpportunities.length > 0 && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                الفرصة المرتبطة (اختياري)
              </label>
              <select
                value={opportunityId}
                onChange={(e) => setOpportunityId(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- بدون ربط بفرصة محددة --</option>
                {customerOpportunities.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title} (${o.expectedValue})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Follow-up Type & Assigned User */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">نوع المتابعة</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as FollowUpType)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.entries(FOLLOWUP_TYPE_MAP).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">الموظف المسؤول</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Due Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">تاريخ المتابعة</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">الوقت المحدد</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              موضوع وهدف المتابعة <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="مثال: الاتصال للتأكد من وصول عينات أوكسيتتراسيكلين واعتماد طلبيات المزرعة..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
            ></textarea>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>جدولة المتابعة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
