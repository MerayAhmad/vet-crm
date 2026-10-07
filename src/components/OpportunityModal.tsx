import React, { useState } from 'react';
import { X, Check, Target, DollarSign, Pill, User } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { OpportunityStage, CustomerSource } from '../types';
import { STAGE_MAP, SOURCE_MAP } from '../utils/helpers';

interface OpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
}

export const OpportunityModal: React.FC<OpportunityModalProps> = ({
  isOpen,
  onClose,
  defaultCustomerId,
}) => {
  const { customers, products, users, currentUser, addOpportunity } = useCrm();

  const [customerId, setCustomerId] = useState(defaultCustomerId || customers[0]?.id || '');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState(20);
  const [expectedValue, setExpectedValue] = useState(300);
  const [assignedTo, setAssignedTo] = useState(currentUser.id);
  const [stage, setStage] = useState<OpportunityStage>('new');
  const [source, setSource] = useState<CustomerSource>('whatsapp');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Auto-calculate expected value when product or quantity changes
  const handleProductChange = (newProdId: string) => {
    setProductId(newProdId);
    const prod = products.find((p) => p.id === newProdId);
    if (prod) {
      setExpectedValue(prod.unitPrice * quantity);
      if (!title) {
        setTitle(`طلبية ${prod.name}`);
      }
    }
  };

  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setExpectedValue(prod.unitPrice * newQty);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError('يرجى اختيار العميل');
      return;
    }
    if (!productId) {
      setError('يرجى اختيار المنتج البيطري');
      return;
    }

    const prod = products.find((p) => p.id === productId);
    const cust = customers.find((c) => c.id === customerId);
    const finalTitle = title.trim() || `طلبية ${prod?.name || 'دواء'} - ${cust?.name || ''}`;

    addOpportunity({
      customerId,
      productId,
      assignedTo,
      title: finalTitle,
      stage,
      quantity: Number(quantity) || 1,
      expectedValue: Number(expectedValue) || 0,
      source,
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
            <Target className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold">إضافة فرصة بيع جديدة في الـ Pipeline</h2>
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

          {/* Customer Selection */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              العميل <span className="text-rose-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city} - {c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Veterinary Product Selection */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              المنتج البيطري <span className="text-rose-500">*</span>
            </label>
            <select
              value={productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - سعر العبوة: ${p.unitPrice}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Expected Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                الكمية المطلوبة (عبوة)
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                القيمة المتوقعة ($)
              </label>
              <input
                type="number"
                min="0"
                value={expectedValue}
                onChange={(e) => setExpectedValue(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-emerald-800"
              />
            </div>
          </div>

          {/* Stage & Assigned User */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">المرحلة الحالية</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as OpportunityStage)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.entries(STAGE_MAP).map(([key, item]) => (
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
                    {u.name} ({u.roleTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">تفاصيل الفرصة</label>
            <textarea
              rows={2}
              placeholder="اكتب ملاحظات إضافية حول احتياج العميل أو موعد التوريد..."
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
              <span>حفظ الفرصة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
