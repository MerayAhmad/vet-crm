import React, { useState } from 'react';
import { X, Check, UserPlus, Phone, MapPin, Building, Pill } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { CustomerType, CustomerSource, CustomerStatus } from '../types';
import { CUSTOMER_TYPE_MAP, SYRIAN_CITIES } from '../utils/helpers';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (customerId: string) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { addCustomer, products, users, currentUser } = useCrm();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('veterinarian');
  const [city, setCity] = useState(SYRIAN_CITIES[0]);
  const [area, setArea] = useState('');
  const [assignedTo, setAssignedTo] = useState(currentUser.id);
  const [source, setSource] = useState<CustomerSource>('whatsapp');
  const [status, setStatus] = useState<CustomerStatus>('new');
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [interestLevel, setInterestLevel] = useState<'hot' | 'warm' | 'inquiry'>('hot');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى إدخال اسم العميل أو المنشأة');
      return;
    }
    if (!phone.trim()) {
      setError('يرجى إدخال رقم الهاتف للتواصل');
      return;
    }

    const interestedProducts = selectedProduct
      ? [
          {
            productId: selectedProduct,
            interestLevel,
            notes: notes ? notes.slice(0, 50) : undefined,
          },
        ]
      : [];

    const newCustomer = addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      customerType,
      city,
      area: area.trim(),
      assignedTo,
      source,
      status,
      notes: notes.trim(),
      interestedProducts,
    });

    // Reset and close
    setName('');
    setPhone('');
    setArea('');
    setNotes('');
    setError('');
    onClose();

    if (onCreated) {
      onCreated(newCustomer.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-900">
            <UserPlus className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold">إضافة عميل بيطري جديد</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs md:text-sm">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                اسم العميل / الطبيب / المزرعة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="مثال: د. أحمد محمد أو مزرعة النور"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                رقم الهاتف (WhatsApp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="09XXXXXXXX"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError('');
                }}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Customer Type & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                نوع العميل <span className="text-rose-500">*</span>
              </label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.entries(CUSTOMER_TYPE_MAP).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                المحافظة / المدينة
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SYRIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Area & Assigned Employee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                المنطقة / الحي (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: الغوطة الغربية / الميدان"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                الموظف المسؤول
              </label>
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

          {/* Interested Product & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
            <div>
              <label className="block text-emerald-950 font-bold mb-1 flex items-center gap-1">
                <Pill className="w-3.5 h-3.5 text-emerald-700" />
                <span>المنتج المهتم به</span>
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              >
                <option value="">-- اختر الدواء البيطري --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-emerald-950 font-bold mb-1">
                مستوى الاهتمام
              </label>
              <select
                value={interestLevel}
                onChange={(e) => setInterestLevel(e.target.value as any)}
                className="w-full h-10 px-3 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              >
                <option value="hot">🔥 مهتم جداً (شراء عاجل)</option>
                <option value="warm">🟡 استفسار ومتابعة</option>
                <option value="inquiry">🔵 طلب كاتالوج وأسعار</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              ملاحظات وتفاصيل الاحتياج
            </label>
            <textarea
              rows={2}
              placeholder="مثال: يمتلك مزرعة أبقار حلوب، مهتم بشراء 50 عبوة أوكسيتتراسيكلين..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ العميل (10 ثوانٍ)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
