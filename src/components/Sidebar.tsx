import React from 'react';
import {
  LayoutDashboard,
  Users,
  Target,
  PhoneCall,
  Pill,
  BarChart3,
  UserCog,
  Settings,
  Sparkles,
  X,
  Stethoscope,
  MessageSquare,
  LogOut
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatRelativeDate } from '../utils/helpers';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
}) => {
  const { customers, opportunities, followUps, companySettings, currentUser, unreadChatCount, logout } = useCrm();

  // Active pending follow-ups badge
  const pendingFollowUps = followUps.filter(f => f.status === 'pending');
  const urgentFollowUpsCount = pendingFollowUps.filter(f => {
    const s = formatRelativeDate(f.dueDate).status;
    return s === 'overdue' || s === 'today';
  }).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'customers',
      label: 'العملاء',
      icon: Users,
      badge: customers.length > 0 ? customers.length : null,
    },
    {
      id: 'pipeline',
      label: 'الفرص (Pipeline)',
      icon: Target,
      badge: opportunities.filter(o => o.stage !== 'won' && o.stage !== 'lost').length,
    },
    {
      id: 'followups',
      label: 'المتابعات',
      icon: PhoneCall,
      badge: urgentFollowUpsCount > 0 ? urgentFollowUpsCount : null,
      badgeColor: urgentFollowUpsCount > 0 ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'chat',
      label: 'الدردشة الداخلية',
      icon: MessageSquare,
      badge: unreadChatCount > 0 ? unreadChatCount : null,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'products',
      label: 'المنتجات البيطرية',
      icon: Pill,
      badge: null,
    },
    {
      id: 'reports',
      label: 'التقارير',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'users',
      label: 'الموظفون والصلاحيات',
      icon: UserCog,
      badge: null,
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col z-50 transition-transform duration-200 ease-in-out border-l border-slate-800 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>VET CRM</span>
                <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800">
                  بيطري
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                {companySettings.companyName}
              </div>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-700 text-white'
                        : item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card at bottom */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 shrink-0">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0 text-right">
                <div className="text-xs font-bold text-slate-200 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser.roleTitle}
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition-colors shrink-0"
              title="تسجيل الخروج من الحساب"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
