import React from 'react';
import { 
  Users, 
  Target, 
  PhoneCall, 
  Flame, 
  ShoppingCart, 
  DollarSign, 
  Plus, 
  ArrowLeft, 
  Check, 
  Clock, 
  AlertCircle,
  Phone,
  MessageCircle,
  TrendingUp,
  ChevronLeft,
  Calendar,
  Pill
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { 
  formatCurrency, 
  formatRelativeDate, 
  createWhatsAppUrl, 
  STAGE_MAP,
  CUSTOMER_TYPE_MAP,
  CUSTOMER_STATUS_MAP
} from '../utils/helpers';
import { OpportunityStage } from '../types';

interface DashboardProps {
  onOpenNewCustomer: () => void;
  onOpenNewOpportunity: () => void;
  onOpenNewFollowUp: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectCustomer: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenNewCustomer,
  onOpenNewOpportunity,
  onOpenNewFollowUp,
  onNavigateTab,
  onSelectCustomer,
}) => {
  const { 
    currentUser, 
    customers, 
    opportunities, 
    followUps, 
    products, 
    sales, 
    completeFollowUp,
    users,
    isManagerOrAdmin
  } = useCrm();

  // Metrics calculations
  const totalCustomersCount = customers.length;
  const openOpportunitiesCount = opportunities.filter(o => o.stage !== 'won' && o.stage !== 'lost').length;
  
  // Follow-ups breakdown
  const pendingFollowUps = followUps.filter(f => f.status === 'pending');
  const overdueFollowUps = pendingFollowUps.filter(f => formatRelativeDate(f.dueDate).status === 'overdue');
  const todayFollowUps = pendingFollowUps.filter(f => formatRelativeDate(f.dueDate).status === 'today');
  const upcomingFollowUps = pendingFollowUps.filter(f => formatRelativeDate(f.dueDate).status === 'upcoming');

  // Hot leads (interested or quotation stage)
  const hotLeadsCount = opportunities.filter(o => o.stage === 'interested' || o.stage === 'quotation').length;
  
  // Orders & Sales: managers & admin see all company sales, sales users see only their sales
  const relevantSales = isManagerOrAdmin ? sales : sales.filter(s => s.userId === currentUser.id);
  const ordersCount = relevantSales.length;
  const totalSalesAmount = relevantSales.reduce((sum, s) => sum + s.totalAmount, 0);

  // Pipeline stages count & values
  const pipelineStages: OpportunityStage[] = ['new', 'contacted', 'interested', 'quotation', 'won'];
  const pipelineSummary = pipelineStages.map(stage => {
    const oppsInStage = opportunities.filter(o => o.stage === stage);
    return {
      stage,
      label: STAGE_MAP[stage].ar,
      count: oppsInStage.length,
      value: oppsInStage.reduce((sum, o) => sum + o.expectedValue, 0),
    };
  });

  // Top products based on opportunities and sales
  const productStats = products.map(prod => {
    const opps = opportunities.filter(o => o.productId === prod.id);
    const prodSales = sales.filter(s => s.productId === prod.id);
    const totalAmount = prodSales.reduce((sum, s) => sum + s.totalAmount, 0);
    return {
      product: prod,
      oppCount: opps.length,
      salesCount: prodSales.length,
      totalAmount,
    };
  }).sort((a, b) => b.oppCount - a.oppCount).slice(0, 4);

  // Recent customers (last 4)
  const recentCustomers = [...customers].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Greeting & Quick Actions */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-800">
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              صباح الخير، {currentUser.name} 👋
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            إليك ملخص نشاطك والمهام البيطرية المطلوبة اليوم في شركة الأدوية
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewCustomer}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة عميل</span>
          </button>
          <button
            onClick={onOpenNewOpportunity}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Target className="w-4 h-4 text-emerald-600" />
            <span>+ إضافة فرصة</span>
          </button>
          <button
            onClick={onOpenNewFollowUp}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>+ متابعة جديدة</span>
          </button>
        </div>
      </div>

      {/* 2. The 6 Main Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: العملاء */}
        <div 
          onClick={() => onNavigateTab('customers')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>العملاء</span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono tabular-nums">
            {totalCustomersCount}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            +12 عميل جديد
          </div>
        </div>

        {/* Card 2: الفرص */}
        <div 
          onClick={() => onNavigateTab('pipeline')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>الفرص</span>
            <Target className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono tabular-nums">
            {openOpportunitiesCount}
          </div>
          <div className="mt-1 text-[11px] text-blue-600 font-medium">
            +8 اليوم
          </div>
        </div>

        {/* Card 3: المتابعات */}
        <div 
          onClick={() => onNavigateTab('followups')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>المتابعات</span>
            <PhoneCall className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono tabular-nums">
            {pendingFollowUps.length}
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-bold">
            {overdueFollowUps.length > 0 ? `${overdueFollowUps.length} متأخرة 🔴` : 'لا يوجد متأخر'}
          </div>
        </div>

        {/* Card 4: مهتمون */}
        <div 
          onClick={() => onNavigateTab('pipeline')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>مهتمون</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono tabular-nums">
            {hotLeadsCount}
          </div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">
            فرص نشطة جداً
          </div>
        </div>

        {/* Card 5: الطلبات */}
        <div 
          onClick={() => onNavigateTab('reports')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>الطلبات</span>
            <ShoppingCart className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono tabular-nums">
            {ordersCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            طلبيات منفذة
          </div>
        </div>

        {/* Card 6: المبيعات */}
        <div 
          onClick={() => onNavigateTab('reports')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>المبيعات</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 font-mono tabular-nums">
            {formatCurrency(totalSalesAmount)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            مكتملة ومسجلة
          </div>
        </div>
      </div>

      {/* 3. Pipeline Odoo-style Summary Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-base text-slate-900">مسار المبيعات والفرص (Pipeline)</h2>
          </div>
          <button
            onClick={() => onNavigateTab('pipeline')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>فتح الـ Pipeline الكامل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {pipelineSummary.map((item) => (
            <div
              key={item.stage}
              onClick={() => onNavigateTab('pipeline')}
              className={`p-3 rounded-xl border ${STAGE_MAP[item.stage].border} ${STAGE_MAP[item.stage].bgSoft} cursor-pointer hover:shadow-xs transition-all`}
            >
              <div className="text-xs font-bold text-slate-600 flex items-center justify-between">
                <span>{item.label}</span>
                <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                  {item.count}
                </span>
              </div>
              <div className="mt-2 text-xs font-mono font-semibold text-slate-700">
                {formatCurrency(item.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Two Columns: Today's Follow-ups & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right 2 Columns: Today's Follow-ups List */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-base text-slate-900">متابعات اليوم والمهام المعلقة</h2>
            </div>
            <button
              onClick={() => onNavigateTab('followups')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>عرض الكل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Overdue Section */}
            {overdueFollowUps.length > 0 && (
              <div>
                <div className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                  <span>متأخرة ({overdueFollowUps.length})</span>
                </div>
                <div className="space-y-2">
                  {overdueFollowUps.slice(0, 2).map((flw) => {
                    const cust = customers.find((c) => c.id === flw.customerId);
                    const opp = opportunities.find((o) => o.id === flw.opportunityId);
                    const prod = products.find((p) => p.id === opp?.productId);
                    const rel = formatRelativeDate(flw.dueDate);

                    return (
                      <div
                        key={flw.id}
                        className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span 
                              onClick={() => cust && onSelectCustomer(cust.id)}
                              className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer text-sm"
                            >
                              {cust?.name || 'العميل'}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="text-rose-700 font-semibold">{rel.label}</span>
                          </div>
                          <div className="text-slate-600 flex items-center gap-2">
                            <span className="font-medium text-emerald-800">{prod?.name || 'منتج بيطري'}</span>
                            <span className="text-slate-400">·</span>
                            <span>{flw.notes}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {cust && (
                            <>
                              <a
                                href={createWhatsAppUrl(cust.phone, cust.name, prod?.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 px-2.5 rounded-lg border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 flex items-center gap-1 font-semibold"
                                title="مراسلة واتساب"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </a>
                              <a
                                href={`tel:${cust.phone}`}
                                className="h-8 px-2.5 rounded-lg border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 flex items-center gap-1 font-semibold"
                                title="اتصال هاتفي"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">اتصال</span>
                              </a>
                            </>
                          )}
                          <button
                            onClick={() => completeFollowUp(flw.id)}
                            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 font-bold shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>تمّت المتابعة</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Today's Section */}
            <div>
              <div className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 mb-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>اليوم ({todayFollowUps.length})</span>
              </div>
              {todayFollowUps.length === 0 ? (
                <div className="text-xs text-slate-400 p-2">لا توجد متابعات إضافية لليوم</div>
              ) : (
                <div className="space-y-2">
                  {todayFollowUps.map((flw) => {
                    const cust = customers.find((c) => c.id === flw.customerId);
                    const opp = opportunities.find((o) => o.id === flw.opportunityId);
                    const prod = products.find((p) => p.id === opp?.productId);

                    return (
                      <div
                        key={flw.id}
                        className="p-3 rounded-xl border border-amber-200 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span 
                              onClick={() => cust && onSelectCustomer(cust.id)}
                              className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer text-sm"
                            >
                              {cust?.name || 'العميل'}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="text-amber-800 font-mono font-bold">{flw.dueTime}</span>
                          </div>
                          <div className="text-slate-600 flex items-center gap-2">
                            <span className="font-medium text-emerald-800">{prod?.name || 'منتج بيطري'}</span>
                            <span className="text-slate-400">·</span>
                            <span>{flw.notes}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {cust && (
                            <>
                              <a
                                href={createWhatsAppUrl(cust.phone, cust.name, prod?.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 px-2.5 rounded-lg border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 flex items-center gap-1 font-semibold"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </a>
                              <a
                                href={`tel:${cust.phone}`}
                                className="h-8 px-2.5 rounded-lg border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 flex items-center gap-1 font-semibold"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">اتصال</span>
                              </a>
                            </>
                          )}
                          <button
                            onClick={() => completeFollowUp(flw.id)}
                            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 font-bold shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>تمّت المتابعة</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Left Column: Top Veterinary Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-base text-slate-900">أفضل المنتجات طلباً</h2>
              </div>
              <button
                onClick={() => onNavigateTab('products')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                الكتالوج
              </button>
            </div>

            <div className="space-y-3">
              {productStats.map((item, idx) => (
                <div
                  key={item.product.id}
                  className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 truncate max-w-[180px]">
                      {item.product.name}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {item.product.categoryAr} · {item.product.formAr}
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <div className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {item.oppCount} فرص
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl">
            <div className="text-xs text-slate-500 font-semibold mb-1">فريق العمل النشط</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-bold">{users.length} موظفين ومندوبين</span>
              <button
                onClick={() => onNavigateTab('users')}
                className="text-emerald-700 font-bold hover:underline"
              >
                إدارة الفريق
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Recent Customers Quick Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-base text-slate-900">آخر العملاء المضافين</h2>
          </div>
          <button
            onClick={() => onNavigateTab('customers')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>عرض كل العملاء</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="text-slate-400 font-semibold border-b border-slate-100 pb-2">
                <th className="pb-2">العميل</th>
                <th className="pb-2">النوع</th>
                <th className="pb-2">المدينة</th>
                <th className="pb-2">الهاتف</th>
                <th className="pb-2">الموظف المسؤول</th>
                <th className="pb-2">الحالة</th>
                <th className="pb-2 text-left">إجراء سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentCustomers.map((cust) => {
                const assignedUser = users.find((u) => u.id === cust.assignedTo);
                const typeObj = CUSTOMER_TYPE_MAP[cust.customerType] || CUSTOMER_TYPE_MAP.other;
                const statusObj = CUSTOMER_STATUS_MAP[cust.status] || CUSTOMER_STATUS_MAP.new;

                return (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-bold text-slate-900">
                      <button
                        onClick={() => onSelectCustomer(cust.id)}
                        className="hover:text-emerald-700 text-right"
                      >
                        {cust.name}
                      </button>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${typeObj.color}`}>
                        {typeObj.ar}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-600">{cust.city}</td>
                    <td className="py-2.5 font-mono text-slate-700">{cust.phone}</td>
                    <td className="py-2.5 text-slate-600">{assignedUser?.name || 'غير محدد'}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dotColor}`}></span>
                        <span className={`font-medium ${statusObj.textColor}`}>{statusObj.ar}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={createWhatsAppUrl(cust.phone, cust.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <a
                          href={`tel:${cust.phone}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="اتصال"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
