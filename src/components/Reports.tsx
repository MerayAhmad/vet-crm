import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Target, 
  PhoneCall, 
  DollarSign, 
  Pill, 
  TrendingUp, 
  Calendar,
  Share2
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatCurrency, SOURCE_MAP } from '../utils/helpers';
import { CustomerSource } from '../types';

export const Reports: React.FC = () => {
  const { users, customers, opportunities, followUps, products, sales } = useCrm();

  const [salesPeriod, setSalesPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // 1. Employee Performance Report
  const employeeReport = users.map((user) => {
    const userCustomers = customers.filter((c) => c.assignedTo === user.id);
    const userOpps = opportunities.filter((o) => o.assignedTo === user.id);
    const userFollowUps = followUps.filter((f) => f.assignedTo === user.id && f.status === 'completed');
    const userSales = sales.filter((s) => s.userId === user.id);
    const totalSales = userSales.reduce((sum, s) => sum + s.totalAmount, 0);

    return {
      user,
      customersCount: userCustomers.length,
      oppsCount: userOpps.length,
      followUpsCompleted: userFollowUps.length,
      salesTotal: totalSales,
    };
  });

  // 2. Product Performance Report
  const productReport = products.map((prod) => {
    const prodOpps = opportunities.filter((o) => o.productId === prod.id);
    const prodSales = sales.filter((s) => s.productId === prod.id);
    const totalSales = prodSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalQty = prodSales.reduce((sum, s) => sum + s.quantity, 0);

    return {
      product: prod,
      oppCount: prodOpps.length,
      salesCount: prodSales.length,
      totalQty,
      totalSales,
    };
  }).sort((a, b) => b.totalSales - a.totalSales);

  // 3. Lead Sources Breakdown
  const sourcesKeys: CustomerSource[] = [
    'whatsapp',
    'facebook',
    'phone',
    'field_visit',
    'referral',
    'website',
    'other',
  ];

  const sourceReport = sourcesKeys.map((src) => {
    const count = customers.filter((c) => c.source === src).length;
    return {
      source: src,
      label: SOURCE_MAP[src]?.ar || src,
      count,
    };
  }).sort((a, b) => b.count - a.count);

  const totalSourcesCount = customers.length || 1;

  // 4. Sales Report calculation
  const totalSalesAll = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>التقارير التحليلية للشركة</span>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
            4 تقارير أساسية
          </span>
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          أداء الموظفين، المنتجات البيطرية الأكثر طلباً، مصادر العملاء، والمبيعات
        </p>
      </div>

      {/* 1. Employee Performance Report */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <h2 className="font-bold text-base text-slate-900">تقرير أداء الموظفين والمندوبين</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">محدث فورياً</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">الموظف</th>
                <th className="py-3 px-4">الدور الوظيفي</th>
                <th className="py-3 px-4">العملاء المسندون</th>
                <th className="py-3 px-4">الفرص المفتوحة</th>
                <th className="py-3 px-4">المتابعات المنجزة</th>
                <th className="py-3 px-4 font-mono text-left">إجمالي المبيعات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employeeReport.map((item) => (
                <tr key={item.user.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                        {item.user.name.charAt(0)}
                      </div>
                      <span>{item.user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{item.user.roleTitle}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {item.customersCount}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    {item.oppsCount}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    {item.followUpsCompleted}
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-slate-900 text-left dir-ltr">
                    {formatCurrency(item.salesTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Products + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Top Products Report */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-700" />
              <h2 className="font-bold text-base text-slate-900">تقرير المنتجات الأكثر مبيعاً وطلباً</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{products.length} صنف</span>
          </div>

          <div className="space-y-3">
            {productReport.slice(0, 5).map((item, idx) => (
              <div
                key={item.product.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">{item.product.name}</div>
                  <div className="text-slate-400 text-[11px]">
                    {item.product.categoryAr} · {item.oppCount} فرصة شراء
                  </div>
                </div>
                <div className="text-left font-mono">
                  <div className="font-bold text-emerald-700 text-sm">
                    {formatCurrency(item.totalSales)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {item.totalQty} عبوة مباعة
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Lead Sources Report */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-700" />
              <h2 className="font-bold text-base text-slate-900">تقرير مصادر العملاء والتواصل</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{customers.length} عميل</span>
          </div>

          <div className="space-y-3">
            {sourceReport.map((item) => {
              const percentage = Math.round((item.count / totalSourcesCount) * 100);

              return (
                <div key={item.source} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span>{item.label}</span>
                    <span className="font-mono">
                      {item.count} عميل ({percentage}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Sales Summary Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-700" />
            <h2 className="font-bold text-base text-slate-900">تقرير المبيعات المسجلة</h2>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSalesPeriod('today')}
              className={`px-3 py-1 rounded-lg ${
                salesPeriod === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              اليوم
            </button>
            <button
              onClick={() => setSalesPeriod('week')}
              className={`px-3 py-1 rounded-lg ${
                salesPeriod === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              الأسبوع
            </button>
            <button
              onClick={() => setSalesPeriod('month')}
              className={`px-3 py-1 rounded-lg ${
                salesPeriod === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              هذا الشهر
            </button>
            <button
              onClick={() => setSalesPeriod('all')}
              className={`px-3 py-1 rounded-lg ${
                salesPeriod === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              الكل
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400">إجمالي المبيعات المحققة</div>
            <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
              {formatCurrency(totalSalesAll)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400">عدد الطلبيات المكتملة</div>
            <div className="text-2xl font-black text-slate-800 font-mono mt-1">
              {sales.length} طلبية
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400">متوسط قيمة الطلبية</div>
            <div className="text-2xl font-black text-slate-800 font-mono mt-1">
              {formatCurrency(Math.round(totalSalesAll / (sales.length || 1)))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
