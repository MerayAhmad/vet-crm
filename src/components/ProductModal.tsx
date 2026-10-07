import React, { useState } from 'react';
import { X, Check, Pill } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { ProductCategory, PharmaceuticalForm } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose }) => {
  const { addProduct } = useCrm();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<ProductCategory>('antibiotics');
  const [categoryAr, setCategoryAr] = useState('المضادات الحيوية');
  const [form, setForm] = useState<PharmaceuticalForm>('injection');
  const [formAr, setFormAr] = useState('حقن');
  const [packaging, setPackaging] = useState('عبوة 100 مل');
  const [unitPrice, setUnitPrice] = useState<number>(15.0);
  const [targetAnimalsStr, setTargetAnimalsStr] = useState('أبقار، أغنام، دواجن');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categoriesMap: Record<ProductCategory, string> = {
    antibiotics: 'المضادات الحيوية',
    anti_inflammatory: 'مضادات التهاب وحساسية',
    vitamins: 'فيتامينات',
    antiparasitics: 'مضادات الطفيليات',
    coccidiostats: 'مضادات كوكسيديا',
    analgesics: 'خافضات الحرارة ومسكن ألام',
    calcium: 'محاليل كلسية',
    rumen_stimulant: 'منشط كرش',
    other: 'منتجات أخرى',
  };

  const formsMap: Record<PharmaceuticalForm, string> = {
    injection: 'حقن',
    oral_solution: 'شراب / محلول فموي',
    powder: 'بودرة',
    ointment: 'مراهم',
    bolus: 'بلعات',
    tablet: 'مضغوطات / تحاميل رحمية',
  };

  const handleCategorySelect = (cat: ProductCategory) => {
    setCategory(cat);
    setCategoryAr(categoriesMap[cat]);
  };

  const handleFormSelect = (f: PharmaceuticalForm) => {
    setForm(f);
    setFormAr(formsMap[f]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى إدخال اسم المستحضر البيطري');
      return;
    }

    const animals = targetAnimalsStr
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);

    addProduct({
      name: name.trim(),
      code: code.trim() || `VET-${Date.now().toString().slice(-4)}`,
      category,
      categoryAr,
      form,
      formAr,
      packaging: packaging.trim(),
      unitPrice: Number(unitPrice) || 0,
      targetAnimals: animals.length > 0 ? animals : ['ماشية', 'دواجن'],
      description: description.trim() || 'مستحضر بيطري معتمد ذو فعالية عالية.',
      isActive: true,
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
            <Pill className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold">إضافة دواء / مستحضر بيطري جديد</h2>
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

          {/* Name & Code */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                اسم الدواء التجاري <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="مثال: أوكسيفيت ل.أ 200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">رمز / كود الصنف</label>
              <input
                type="text"
                placeholder="مثال: VET-OXY-200"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Category & Form */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">الفئة الدوائية</label>
              <select
                value={category}
                onChange={(e) => handleCategorySelect(e.target.value as ProductCategory)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              >
                {Object.entries(categoriesMap).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">الشكل الصيدلاني</label>
              <select
                value={form}
                onChange={(e) => handleFormSelect(e.target.value as PharmaceuticalForm)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              >
                {Object.entries(formsMap).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Packaging & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">التعبئة والحجم</label>
              <input
                type="text"
                placeholder="مثال: عبوة 100 مل / 1 لتر"
                value={packaging}
                onChange={(e) => setPackaging(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">السعر التقريبي ($)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Target Animals */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              الحيوانات المستهدفة (مفصولة بفاصلة)
            </label>
            <input
              type="text"
              placeholder="مثال: أبقار، أغنام، ماعز، دواجن، خيول"
              value={targetAnimalsStr}
              onChange={(e) => setTargetAnimalsStr(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">الوصف والاستطبابات</label>
            <textarea
              rows={2}
              placeholder="اكتب دواعي الاستعمال والجرعات بإيجاز..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
            ></textarea>
          </div>

          {/* Buttons */}
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
              <span>إضافة الصنف الدوائي</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
