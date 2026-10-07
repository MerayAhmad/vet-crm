import React, { useState } from 'react';
import { 
  ArrowRight, 
  MessageCircle, 
  Phone, 
  Plus, 
  Clock, 
  Target, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  User, 
  MapPin, 
  Building2, 
  Pill, 
  Send,
  Trash2,
  Edit2,
  DollarSign,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { 
  CUSTOMER_TYPE_MAP, 
  CUSTOMER_STATUS_MAP, 
  createWhatsAppUrl, 
  createPhoneUrl, 
  formatDateArabic,
  STAGE_MAP,
  formatCurrency
} from '../utils/helpers';
import { ActivityType, OpportunityStage } from '../types';

interface CustomerDetailsProps {
  customerId: string;
  onBack: () => void;
  onOpenNewOpportunityForCustomer: (customerId: string) => void;
  onOpenNewFollowUpForCustomer: (customerId: string) => void;
  onOpenChatWithUser?: (userId: string) => void;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customerId,
  onBack,
  onOpenNewOpportunityForCustomer,
  onOpenNewFollowUpForCustomer,
  onOpenChatWithUser,
}) => {
  const { 
    getCustomerById, 
    updateCustomer, 
    deleteCustomer,
    getCustomerActivities, 
    addActivity, 
    opportunities, 
    followUps, 
    products, 
    users,
    currentUser,
    isManagerOrAdmin,
    completeFollowUp
  } = useCrm();

  const customer = getCustomerById(customerId);
  const [quickNote, setQuickNote] = useState('');
  const [noteType, setNoteType] = useState<ActivityType>('note');
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(customer?.notes || '');
  const [selectedAddProduct, setSelectedAddProduct] = useState('');

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">لم يتم العثور على العميل المطلوب</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs"
        >
          العودة لقائمة العملاء
        </button>
      </div>
    );
  }

  const assignedUser = users.find((u) => u.id === customer.assignedTo);
  const typeObj = CUSTOMER_TYPE_MAP[customer.customerType] || CUSTOMER_TYPE_MAP.other;
  const statusObj = CUSTOMER_STATUS_MAP[customer.status] || CUSTOMER_STATUS_MAP.new;
  const activities = getCustomerActivities(customerId);
  const customerOpportunities = opportunities.filter((o) => o.customerId === customerId);
  const customerFollowUps = followUps.filter((f) => f.customerId === customerId);

  // Quick activity note submission
  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;

    const titles: Record<ActivityType, string> = {
      note: 'ملاحظة جديدة',
      call: 'مكالمة هاتفية',
      whatsapp: 'مراسلة WhatsApp',
      facebook: 'مراسلة Facebook',
      visit: 'زيارة ميدانية',
      email: 'بريد إلكتروني',
      customer_created: 'إنشاء العميل',
      opportunity_created: 'فرصة جديدة',
      stage_change: 'تحديث مرحلة',
      followup_done: 'إنجاز متابعة',
      sale_recorded: 'تسجيل بيع',
    };

    addActivity({
      customerId: customer.id,
      userId: currentUser.id,
      type: noteType,
      title: titles[noteType] || 'ملاحظة',
      description: quickNote.trim(),
    });

    setQuickNote('');
  };

  // Add interested product
  const handleAddProduct = () => {
    if (!selectedAddProduct) return;
    const exists = customer.interestedProducts.some((p) => p.productId === selectedAddProduct);
    if (!exists) {
      const updated = [
        ...customer.interestedProducts,
        { productId: selectedAddProduct, interestLevel: 'hot' as const },
      ];
      updateCustomer(customer.id, { interestedProducts: updated });
      const prod = products.find((p) => p.id === selectedAddProduct);
      addActivity({
        customerId: customer.id,
        userId: currentUser.id,
        type: 'note',
        title: 'إضافة اهتمام دوائي',
        description: `أبدى العميل اهتماماً بمنتج: ${prod?.name || 'دواء بيطري'}.`,
      });
    }
    setSelectedAddProduct('');
  };

  // Activity icon helper
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-emerald-600" />;
      case 'call':
        return <Phone className="w-4 h-4 text-blue-600" />;
      case 'visit':
        return <MapPin className="w-4 h-4 text-purple-600" />;
      case 'stage_change':
      case 'opportunity_created':
        return <Target className="w-4 h-4 text-amber-600" />;
      case 'sale_recorded':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'followup_done':
        return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
      case 'customer_created':
        return <User className="w-4 h-4 text-slate-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Top Bar: Back & Main Contact Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="رجوع"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {customer.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${typeObj.color}`}>
                {typeObj.ar}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                • {customer.city} {customer.area ? `(${customer.area})` : ''}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 dir-ltr text-right">
              {customer.phone}
            </p>
          </div>
        </div>

        {/* Primary Contact Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp Direct */}
          <a
            href={createWhatsAppUrl(customer.phone, customer.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          {/* Phone Direct */}
          <a
            href={createPhoneUrl(customer.phone)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>اتصال</span>
          </a>

          {/* Add Follow-Up */}
          <button
            onClick={() => onOpenNewFollowUpForCustomer(customer.id)}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>+ متابعة</span>
          </button>

          {/* Add Opportunity */}
          <button
            onClick={() => onOpenNewOpportunityForCustomer(customer.id)}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ فرصة بيع</span>
          </button>

          {/* Chat with assigned employee for manager/admin */}
          {assignedUser && assignedUser.id !== currentUser.id && isManagerOrAdmin && onOpenChatWithUser && (
            <button
              onClick={() => onOpenChatWithUser(assignedUser.id)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold rounded-xl text-xs transition-colors shadow-xs"
              title={`فتح محادثة مع ${assignedUser.name} لمتابعة سير العمل بخصوص هذا العميل`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
              <span>محادثة الموظف ({assignedUser.name})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Grid: Info + Products | Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right Column: Customer Info & Interested Products */}
        <div className="space-y-6">
          {/* Information Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              معلومات العميل
            </h2>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">رقم الهاتف:</span>
                <span className="font-mono font-bold text-slate-900 dir-ltr">{customer.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">المدينة / المنطقة:</span>
                <span className="font-medium text-slate-800">
                  {customer.city} {customer.area ? `· ${customer.area}` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">نوع العميل:</span>
                <span className="font-semibold text-slate-800">{typeObj.ar}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">الموظف المسؤول:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-emerald-800">
                    {assignedUser?.name || 'غير مسند'} ({assignedUser?.roleTitle || ''})
                  </span>
                  {assignedUser && assignedUser.id !== currentUser.id && isManagerOrAdmin && onOpenChatWithUser && (
                    <button
                      onClick={() => onOpenChatWithUser(assignedUser.id)}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center gap-1 transition-colors"
                      title="مراسلة الموظف وإرسال ملاحظات"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-700" />
                      <span>مراسلة</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">حالة العميل:</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${statusObj.dotColor}`}></span>
                  <span className={`font-bold ${statusObj.textColor}`}>{statusObj.ar}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">تاريخ الإضافة:</span>
                <span className="font-mono text-slate-600">
                  {formatDateArabic(customer.createdAt)}
                </span>
              </div>
            </div>

            {/* Notes Section with edit */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700">ملاحظات العميل:</span>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[11px] text-emerald-700 font-semibold hover:underline"
                  >
                    تعديل
                  </button>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-2.5 py-1 text-slate-600 text-[11px] rounded"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => {
                        updateCustomer(customer.id, { notes: editNotes });
                        setIsEditing(false);
                      }}
                      className="px-3 py-1 bg-emerald-700 text-white font-bold text-[11px] rounded-lg"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {customer.notes || 'لا توجد ملاحظات مسجلة حتى الآن.'}
                </p>
              )}
            </div>
          </div>

          {/* Interested Products Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                <Pill className="w-4 h-4 text-emerald-700" />
                <span>المنتجات المهتم بها</span>
              </div>
              <span className="font-mono text-slate-400 font-bold">
                {customer.interestedProducts.length}
              </span>
            </div>

            <div className="space-y-2">
              {customer.interestedProducts.length === 0 ? (
                <p className="text-slate-400 py-2 text-center">لم يتم تحديد منتجات بعد</p>
              ) : (
                customer.interestedProducts.map((item, idx) => {
                  const prod = products.find((p) => p.id === item.productId);
                  const isHot = item.interestLevel === 'hot';
                  const isWarm = item.interestLevel === 'warm';

                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{prod?.name || 'دواء بيطري'}</div>
                        <div className="text-[10px] text-slate-400">
                          {prod?.categoryAr} · {prod?.formAr}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHot
                            ? 'bg-rose-100 text-rose-700'
                            : isWarm
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {isHot ? '🔥 مهتم جداً' : isWarm ? '🟡 استفسار' : '🔵 كاتالوج'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick add product to interest list */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
              <select
                value={selectedAddProduct}
                onChange={(e) => setSelectedAddProduct(e.target.value)}
                className="flex-1 h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="">+ إضافة منتج بيطري</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={!selectedAddProduct}
                className="h-8 px-3 bg-emerald-700 disabled:opacity-40 text-white rounded-lg font-bold text-xs"
              >
                إضافة
              </button>
            </div>
          </div>

          {/* Active Opportunities for Customer */}
          {customerOpportunities.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                فرص البيع المرتبطة ({customerOpportunities.length})
              </h2>
              <div className="space-y-2">
                {customerOpportunities.map((opp) => {
                  const prod = products.find((p) => p.id === opp.productId);
                  const stageObj = STAGE_MAP[opp.stage];

                  return (
                    <div
                      key={opp.id}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{opp.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${stageObj.color} ${stageObj.bgSoft}`}>
                          {stageObj.ar}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>{prod?.name} ({opp.quantity} عبوة)</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {formatCurrency(opp.expectedValue)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Left 2 Columns: Activity Timeline (سجل النشاطات الزمني) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Note / Activity Composer */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>تسجيل نشاط أو ملاحظة سريعة في السجل</span>
            </h2>

            <form onSubmit={handleAddQuickNote} className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 font-semibold">نوع النشاط:</span>
                <button
                  type="button"
                  onClick={() => setNoteType('note')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    noteType === 'note' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  📝 ملاحظة
                </button>
                <button
                  type="button"
                  onClick={() => setNoteType('whatsapp')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    noteType === 'whatsapp' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  💬 WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setNoteType('call')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    noteType === 'call' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  📞 اتصال
                </button>
                <button
                  type="button"
                  onClick={() => setNoteType('visit')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    noteType === 'visit' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  📍 زيارة
                </button>
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder="اكتب ما دار مع العميل (مثلاً: تم الاتصال، طلب معرفة الأسعار، مهتم بـ 50 عبوة...)"
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!quickNote.trim()}
                  className="px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex flex-col items-center justify-center gap-1 transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>حفظ</span>
                </button>
              </div>
            </form>
          </div>

          {/* Activity Timeline List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>سجل النشاطات الزمني (Activity Timeline)</span>
              </h2>
              <span className="text-xs font-mono text-slate-400 font-bold">
                {activities.length} حركة مسجلة
              </span>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                لا توجد نشاطات مسجلة بعد لهذا العميل.
              </div>
            ) : (
              <div className="relative pr-6 border-r-2 border-slate-100 space-y-6 mr-3">
                {activities.map((act) => {
                  const author = users.find((u) => u.id === act.userId);

                  return (
                    <div key={act.id} className="relative group">
                      {/* Timeline dot with icon */}
                      <div className="absolute -right-[35px] top-0 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                        {getActivityIcon(act.type)}
                      </div>

                      {/* Content Card */}
                      <div className="bg-slate-50/70 hover:bg-slate-50 p-3.5 rounded-xl border border-slate-200 transition-colors">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-900">{act.title}</span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {formatDateArabic(act.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">
                          {act.description}
                        </p>
                        <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                          <span>بواسطة:</span>
                          <span className="font-medium text-slate-600">
                            {author?.name || 'النظام'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
