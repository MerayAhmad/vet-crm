import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Search, 
  UserCheck, 
  ChevronDown, 
  AlertCircle, 
  Clock, 
  Check, 
  Shield, 
  Menu,
  Phone,
  MessageCircle,
  X,
  Edit3,
  MessageSquare,
  LogOut
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatRelativeDate, createWhatsAppUrl } from '../utils/helpers';

interface HeaderProps {
  onOpenNewCustomer: () => void;
  onOpenNewOpportunity: () => void;
  onOpenNewFollowUp: () => void;
  onSelectCustomer: (id: string) => void;
  onToggleMobileMenu: () => void;
  onNavigateTab?: (tab: string) => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewCustomer,
  onOpenNewOpportunity,
  onOpenNewFollowUp,
  onSelectCustomer,
  onToggleMobileMenu,
  onNavigateTab,
  activeTab,
}) => {
  const { 
    currentUser, 
    users, 
    switchUser, 
    followUps, 
    customers, 
    roleFilterApplied, 
    setRoleFilterApplied,
    completeFollowUp,
    unreadChatCount,
    logout
  } = useCrm();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Urgent follow-ups: pending items that are overdue or today
  const urgentFollowUps = followUps.filter((f) => {
    if (f.status !== 'pending') return false;
    const rel = formatRelativeDate(f.dueDate);
    return rel.status === 'overdue' || rel.status === 'today';
  });

  const overdueCount = followUps.filter((f) => f.status === 'pending' && formatRelativeDate(f.dueDate).status === 'overdue').length;
  const todayCount = followUps.filter((f) => f.status === 'pending' && formatRelativeDate(f.dueDate).status === 'today').length;

  // Global search matching customers
  const searchResults = globalSearch.trim().length > 1
    ? customers.filter(c => 
        c.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        c.phone.includes(globalSearch) ||
        c.city.toLowerCase().includes(globalSearch.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between">
      {/* Right side (RTL Start): Mobile Menu & Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="القائمة الرئيسية"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            <input
              type="text"
              placeholder="بحث بالاسم، الهاتف، المدينة..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              className="w-48 sm:w-72 md:w-80 h-9 pr-9 pl-4 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {globalSearch && (
              <button 
                onClick={() => setGlobalSearch('')}
                className="absolute left-2.5 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-11 right-0 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">
              <div className="text-xs font-semibold text-slate-400 px-3 py-1">نتائج العملاء</div>
              {searchResults.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCustomer(c.id);
                    setIsSearchOpen(false);
                    setGlobalSearch('');
                  }}
                  className="w-full text-right p-2.5 hover:bg-emerald-50 rounded-lg flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.city} · {c.phone}</div>
                  </div>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    عرض
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Left side (RTL End): Quick Add + Notifications + Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Menu */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1.5 h-9 px-3 text-xs md:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة جديدة</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showAddMenu && (
            <div 
              className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setShowAddMenu(false)}
            >
              <button
                onClick={() => {
                  setShowAddMenu(false);
                  onOpenNewCustomer();
                }}
                className="w-full text-right px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center justify-between"
              >
                <span>👤 عميل جديد</span>
                <span className="text-xs text-slate-400">10 ثوانٍ</span>
              </button>
              <button
                onClick={() => {
                  setShowAddMenu(false);
                  onOpenNewOpportunity();
                }}
                className="w-full text-right px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center justify-between"
              >
                <span>🎯 فرصة بيع</span>
                <span className="text-xs text-slate-400">Pipeline</span>
              </button>
              <button
                onClick={() => {
                  setShowAddMenu(false);
                  onOpenNewFollowUp();
                }}
                className="w-full text-right px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center justify-between"
              >
                <span>📞 متابعة للعميل</span>
                <span className="text-xs text-slate-400">اليوم/غداً</span>
              </button>
            </div>
          )}
        </div>

        {/* Internal In-App Chat Shortcut */}
        <button
          onClick={() => onNavigateTab?.('chat')}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="الدردشة والتوجيهات الداخلية"
        >
          <MessageSquare className="w-5 h-5" />
          {unreadChatCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-xs">
              {unreadChatCount}
            </span>
          )}
        </button>

        {/* Urgent Follow-ups Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="المتابعات والتنبيهات"
          >
            <Bell className="w-5 h-5" />
            {urgentFollowUps.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
                {urgentFollowUps.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>تنبيهات المتابعات المطلوبة</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {overdueCount > 0 && (
                    <span className="text-rose-600 font-semibold">{overdueCount} متأخرة</span>
                  )}
                  {todayCount > 0 && (
                    <span className="text-amber-600 font-semibold">{todayCount} اليوم</span>
                  )}
                </div>
              </div>

              <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                {urgentFollowUps.length === 0 ? (
                  <div className="text-center py-6 text-sm text-slate-400">
                    🎉 لا توجد أي متابعات متأخرة أو مستحقة حالياً. عمل رائع!
                  </div>
                ) : (
                  urgentFollowUps.map((f) => {
                    const cust = customers.find((c) => c.id === f.customerId);
                    const rel = formatRelativeDate(f.dueDate);
                    const isOverdue = rel.status === 'overdue';

                    return (
                      <div
                        key={f.id}
                        className={`p-2.5 rounded-lg border text-xs transition-colors ${
                          isOverdue ? 'bg-rose-50/50 border-rose-200' : 'bg-amber-50/50 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-900">
                          <span className="truncate">{cust?.name || 'عميل'}</span>
                          <span className={`px-1.5 py-0.5 rounded font-mono ${isOverdue ? 'text-rose-700 bg-rose-100' : 'text-amber-700 bg-amber-100'}`}>
                            {rel.label} {f.dueTime}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 line-clamp-1">{f.notes}</p>
                        <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                            {cust && (
                              <>
                                <a
                                  href={createWhatsAppUrl(cust.phone, cust.name)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                                  title="فتح واتساب"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={`tel:${cust.phone}`}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  title="اتصال"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => completeFollowUp(f.id)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-300 px-2 py-0.5 rounded shadow-xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>تمّت المتابعة</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {currentUser.roleTitle}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 text-right">
                <div className="text-xs font-semibold text-slate-400">المستخدم الحالي والصلاحية</div>
                <div className="text-sm font-bold text-slate-800">{currentUser.name}</div>
                <div className="text-xs text-emerald-600 font-medium">{currentUser.email}</div>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onNavigateTab?.('users');
                  }}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-bold transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>تعديل حسابي الشخصي</span>
                </button>
              </div>

              {/* Role filter toggle when sales */}
              {currentUser.role === 'sales' && (
                <div className="p-2 my-1 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-amber-900">نظام الصلاحيات (RLS)</span>
                    <button
                      onClick={() => setRoleFilterApplied(!roleFilterApplied)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        roleFilterApplied ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {roleFilterApplied ? 'مفعل: عملائي فقط' : 'إظهار الكل'}
                    </button>
                  </div>
                  <p className="text-amber-800 text-[11px] leading-tight">
                    موظف المبيعات يرى فقط عملائه المسندين إليه حسب متطلبات النظام.
                  </p>
                </div>
              )}

              <div className="pt-2 text-right">
                <div className="text-xs font-semibold text-slate-400 px-3 pb-1">
                  التبديل بين موظفي الشركة (تجربة الأدوار):
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-right px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.roleTitle}</div>
                    </div>
                    {u.id === currentUser.id && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 mt-2">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full text-right px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center justify-between transition-colors"
                >
                  <span>تسجيل الخروج من الحساب</span>
                  <LogOut className="w-4 h-4 text-rose-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
