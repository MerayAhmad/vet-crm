import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Stethoscope, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Shield, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export const LoginScreen: React.FC = () => {
  const { login, users, companySettings } = useCrm();

  const [username, setUsername] = useState('meray');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('يرجى إدخال اسم المستخدم أو البريد الإلكتروني');
      return;
    }
    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    setLoading(true);
    const result = login(username, password);

    if (!result.success) {
      setLoading(false);
      setError(result.error || 'فشل تسجيل الدخول');
    }
  };

  const handleQuickLogin = (uname: string, pass: string) => {
    setUsername(uname);
    setPassword(pass);
    setError('');
    const result = login(uname, pass);
    if (!result.success) {
      setError(result.error || 'فشل تسجيل الدخول');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-600 selection:text-white" dir="rtl">
      {/* Container */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 mb-1">
              <span>🐾 VET CRM</span>
              <span>·</span>
              <span>نظام إدارة العملاء البيطري</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {companySettings.companyName}
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              {companySettings.companyNameEn}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              اسم المستخدم أو البريد الإلكتروني
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="meray / luna / nada / hiba / safaa / masa ..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full h-11 pr-10 pl-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-mono"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="كلمة المرور (الافتراضية: 123)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full h-11 pr-10 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>تسجيل الدخول إلى النظام</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Logins Helper */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-400">
              الدخول السريع بحسابات الموظفين (كلمة المرور: 123)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Meray (Admin) */}
            <button
              type="button"
              onClick={() => handleQuickLogin('meray', '123')}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-right transition-colors"
            >
              <div className="font-bold text-purple-950 flex items-center gap-1">
                <span>مرعي الاحمد</span>
                <span className="text-[10px] text-purple-600 font-normal">(Admin)</span>
              </div>
              <div className="text-[10px] text-purple-700 font-mono">
                يوزر: meray
              </div>
            </button>

            {/* Ahmad (Marketing Manager) */}
            <button
              type="button"
              onClick={() => handleQuickLogin('ahmad', '123')}
              className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-right transition-colors"
            >
              <div className="font-bold text-blue-950 flex items-center gap-1">
                <span>أحمد المصري</span>
                <span className="text-[10px] text-blue-600 font-normal">(مدير التسويق)</span>
              </div>
              <div className="text-[10px] text-blue-700 font-mono">
                يوزر: ahmad
              </div>
            </button>

            {/* Sara (Sales) */}
            <button
              type="button"
              onClick={() => handleQuickLogin('sara', '123')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-right transition-colors"
            >
              <div className="font-bold text-emerald-950 flex items-center gap-1">
                <span>سارة المحمود</span>
                <span className="text-[10px] text-emerald-600 font-normal">(Call Center)</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-mono">
                يوزر: sara
              </div>
            </button>

            {/* Mohammed (Field Rep) */}
            <button
              type="button"
              onClick={() => handleQuickLogin('mohammed', '123')}
              className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-right transition-colors"
            >
              <div className="font-bold text-amber-950 flex items-center gap-1">
                <span>محمد العبدالله</span>
                <span className="text-[10px] text-amber-600 font-normal">(مندوب)</span>
              </div>
              <div className="text-[10px] text-amber-700 font-mono">
                يوزر: mohammed
              </div>
            </button>

            {/* luna */}
            <button
              type="button"
              onClick={() => handleQuickLogin('luna', '123')}
              className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-right transition-colors"
            >
              <div className="font-bold text-rose-950 flex items-center gap-1">
                <span>لونا أيوب</span>
                <span className="text-[10px] text-rose-600 font-normal">(مدير التسويق)</span>
              </div>
              <div className="text-[10px] text-rose-700 font-mono">
                يوزر: luna
              </div>
            </button>

            {/* nada */}
            <button
              type="button"
              onClick={() => handleQuickLogin('nada', '123')}
              className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-right transition-colors"
            >
              <div className="font-bold text-rose-950 flex items-center gap-1">
                <span>ندى دلال</span>
                <span className="text-[10px] text-rose-600 font-normal">(موظفة تسويق)</span>
              </div>
              <div className="text-[10px] text-rose-700 font-mono">
                يوزر: nada
              </div>
            </button>

            {/* hiba */}
            <button
              type="button"
              onClick={() => handleQuickLogin('hiba', '123')}
              className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-right transition-colors"
            >
              <div className="font-bold text-rose-950 flex items-center gap-1">
                <span>هبة السمرا</span>
                <span className="text-[10px] text-rose-600 font-normal">(موظفة تسويق)</span>
              </div>
              <div className="text-[10px] text-rose-700 font-mono">
                يوزر: hiba
              </div>
            </button>

            {/* safaa */}
            <button
              type="button"
              onClick={() => handleQuickLogin('safaa', '123')}
              className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-right transition-colors"
            >
              <div className="font-bold text-rose-950 flex items-center gap-1">
                <span>صفاء دهشان</span>
                <span className="text-[10px] text-rose-600 font-normal">(موظفة تسويق)</span>
              </div>
              <div className="text-[10px] text-rose-700 font-mono">
                يوزر: safaa
              </div>
            </button>

            {/* masa */}
            <button
              type="button"
              onClick={() => handleQuickLogin('masa', '123')}
              className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-right transition-colors"
            >
              <div className="font-bold text-rose-950 flex items-center gap-1">
                <span>ماسة أبو النصر</span>
                <span className="text-[10px] text-rose-600 font-normal">(موظفة تسويق)</span>
              </div>
              <div className="text-[10px] text-rose-700 font-mono">
                يوزر: masa
              </div>
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>نظام محمي بصلاحيات الأدوار والخصوصية (Role-Based Access)</span>
        </div>
      </div>
    </div>
  );
};
