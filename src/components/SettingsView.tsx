import React, { useState } from 'react';
import { 
  Settings, 
  Building, 
  DollarSign, 
  Phone, 
  Mail, 
  MapPin, 
  Download, 
  RotateCcw, 
  Check, 
  ShieldCheck,
  Stethoscope,
  Info
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export const SettingsView: React.FC = () => {
  const { 
    companySettings, 
    updateCompanySettings, 
    resetToDemoData, 
    exportDataAsJson, 
    currentUser,
    isAdmin 
  } = useCrm();

  const [name, setName] = useState(companySettings.companyName);
  const [nameEn, setNameEn] = useState(companySettings.companyNameEn);
  const [currency, setCurrency] = useState(companySettings.currency);
  const [phone, setPhone] = useState(companySettings.phone);
  const [email, setEmail] = useState(companySettings.email);
  const [address, setAddress] = useState(companySettings.address);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if companySettings changes
  React.useEffect(() => {
    setName(companySettings.companyName);
    setNameEn(companySettings.companyNameEn);
    setCurrency(companySettings.currency);
    setPhone(companySettings.phone);
    setEmail(companySettings.email);
    setAddress(companySettings.address);
  }, [companySettings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    updateCompanySettings({
      companyName: name,
      companyNameEn: nameEn,
      currency,
      phone,
      email,
      address,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (!isAdmin) return;
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة تعيين البيانات التجريبية الأولية؟ سيتم استرجاع قائمة العملاء والأدوية الافتراضية لشركة أكبيطرة للأدوية البيطرية.')) {
      resetToDemoData();
      setName('شركة أكبيطرة للأدوية البيطرية');
      setNameEn('Akbitra Veterinary Pharma');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>إعدادات النظام والشركة</span>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
            Vet CRM
          </span>
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          بيانات شركة الأدوية البيطرية والعملة وتصدير النسخ الاحتياطية
        </p>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>تم حفظ إعدادات الشركة بنجاح!</span>
        </div>
      )}

      {/* Company Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
          <Building className="w-5 h-5 text-emerald-700" />
          <h2 className="font-bold text-base">بيانات شركة الأدوية البيطرية</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs md:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                اسم الشركة (بالعربية)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                اسم الشركة (بالإنجليزية)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">العملة الافتراضية</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="$">الدولار الأمريكي ($)</option>
                <option value="ل.س">الليرة السورية (ل.س)</option>
                <option value="€">اليورو (€)</option>
                <option value="ر.س">الريال السعودي (ر.س)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">هاتف الاستعلامات</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">البريد الرسمي</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">العنوان والمقر الرئيسي</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup and Data Management */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Download className="w-5 h-5 text-emerald-700" />
          <span>النسخ الاحتياطي وإدارة البيانات</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Export JSON */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="font-bold text-slate-900">تصدير نسخة كاملة (JSON)</div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              تنزيل ملف يحتوي على كافة بيانات العملاء، الفرص، المتابعات، سجل النشاطات، والمبيعات.
            </p>
            <button
              onClick={exportDataAsJson}
              className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير البيانات الآن</span>
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2">
            <div className="font-bold text-rose-900">إعادة ضبط البيانات التجريبية</div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              إعادة النظام إلى البيانات النموذجية الأولية للأدوية البيطرية والعملاء المسجلين.
            </p>
            <button
              onClick={handleReset}
              className="mt-2 px-4 py-2 bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة تعيين البيانات الأولية</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
