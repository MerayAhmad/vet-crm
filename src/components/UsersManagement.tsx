import React, { useState } from 'react';
import { 
  UserCog, 
  Plus, 
  Shield, 
  ShieldCheck, 
  UserCheck, 
  Mail, 
  Phone, 
  Check, 
  X, 
  Lock, 
  Edit3, 
  Trash2, 
  ArrowRightLeft,
  Info,
  MessageSquare,
  KeyRound
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { User, UserRole } from '../types';

interface UsersManagementProps {
  onOpenChatWithUser?: (userId: string) => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  onOpenChatWithUser,
}) => {
  const { 
    visibleUsers, 
    currentUser, 
    switchUser, 
    addUser, 
    updateUser, 
    deleteUser, 
    customers, 
    opportunities, 
    isAdmin, 
    isManager,
    isManagerOrAdmin,
    canManageUsers 
  } = useCrm();

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // New user form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('sales');
  const [roleTitle, setRoleTitle] = useState('موظف مبيعات وتواصل');
  const [error, setError] = useState('');

  // Edit user form state
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('sales');
  const [editRoleTitle, setEditRoleTitle] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editError, setEditError] = useState('');

  const roleTitlesMap: Record<UserRole, string> = {
    admin: 'المدير العام ومدير النظام',
    manager: 'مدير التسويق والمبيعات',
    sales: 'موظف مبيعات وتواصل (Sales / Call Center)',
  };

  const handleRoleChange = (r: UserRole) => {
    setRole(r);
    setRoleTitle(roleTitlesMap[r]);
  };

  const handleEditRoleChange = (r: UserRole) => {
    setEditRole(r);
    setEditRoleTitle(roleTitlesMap[r]);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى إدخال اسم الموظف');
      return;
    }
    if (!username.trim()) {
      setError('يرجى إدخال اسم المستخدم لتسجيل الدخول');
      return;
    }
    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    addUser({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password: password.trim(),
      email: email.trim() || `${username.trim().toLowerCase()}@akbitra-pharma.sy`,
      phone: phone.trim() || '09XXXXXXXX',
      role,
      roleTitle,
      isActive: true,
    });

    setName('');
    setUsername('');
    setPassword('123');
    setEmail('');
    setPhone('');
    setError('');
    setIsAddUserModalOpen(false);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditUsername(user.username || '');
    setEditPassword(user.password || '');
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setEditRole(user.role);
    setEditRoleTitle(user.roleTitle);
    setEditIsActive(user.isActive);
    setEditError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim()) {
      setEditError('يرجى إدخال الاسم');
      return;
    }

    updateUser(editingUser.id, {
      name: editName.trim(),
      username: editUsername.trim().toLowerCase() || editingUser.username,
      password: editPassword.trim() || editingUser.password,
      email: editEmail.trim(),
      phone: editPhone.trim(),
      // Only admin can change roles
      role: isAdmin ? editRole : editingUser.role,
      roleTitle: isAdmin ? editRoleTitle : editingUser.roleTitle,
      isActive: isAdmin ? editIsActive : editingUser.isActive,
    });

    setEditingUser(null);
  };

  const handleDelete = (id: string, userName: string) => {
    if (!isAdmin) return;
    if (confirm(`هل أنت متأكد من حذف حساب الموظف "${userName}"؟`)) {
      deleteUser(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>فريق العمل والصلاحيات (RBAC)</span>
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {visibleUsers.length} مستخدمين معروضين
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isManagerOrAdmin
              ? 'بصفتك مديراً (نظام/تسويق)، يمكنك متابعة كافة مستخدمي الشركة والتواصل معهم وإنشاء حسابات جديدة'
              : 'يمكنك إدارة وتعديل معلومات حسابك الشخصي ومتابعة العملاء المسندين إليك'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Edit My Profile */}
          <button
            onClick={() => handleOpenEdit(currentUser)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
            <span>تعديل حسابي</span>
          </button>

          {/* User Creation: Both Admin and Marketing Manager have permission */}
          {canManageUsers && (
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ إنشاء مستخدم جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Permissions Context Banner for Regular Employees */}
      {!isManagerOrAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">نظام حماية خصوصية الموظفين والعملاء (RLS):</span>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              أنت مسجل حالياً بحساب موظف مبيعات وتواصل (<strong className="font-bold">{currentUser.name}</strong>). يقتصر وصولك على رؤية وتعديل بيانات ملفك الشخصي وعملائك وفرصك فقط. مدير النظام (مرعي الاحمد) ومدير التسويق هما فقط المخولان بالاطلاع على جميع مستخدمي وعملاء الشركة.
            </p>
          </div>
        </div>
      )}

      {/* Roles & Permissions Explanation Card for Admins/Managers */}
      {isManagerOrAdmin && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>هيكل الصلاحيات المعتمد في شركة أكبيطرة للأدوية البيطرية:</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Admin */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>مدير النظام (مرعي الاحمد)</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                صلاحية كاملة: إنشاء وتعديل كافة المستخدمين، متابعة آلية سير العمل، وفتح محادثات مباشرة مع أي موظف.
              </p>
            </div>

            {/* Manager */}
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-950">
                <UserCheck className="w-4 h-4 text-blue-700" />
                <span>مدير التسويق (أحمد المصري)</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                إنشاء مستخدمين جدد، رؤية جميع المعلومات لمتابعة سير العمل، وإرسال الملاحظات للموظفين عبر الدردشة الداخلية.
              </p>
            </div>

            {/* Sales */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>موظف المبيعات والتواصل</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                يرى فقط عملاءه وفرصه ومتابعاته المسندة إليه، ويستقبل توجيهات وملاحظات الإدارة عبر الدردشة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Users List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-sm text-slate-900">
            {isManagerOrAdmin ? 'قائمة حسابات موظفي الشركة' : 'بيانات حسابك الشخصي'}
          </span>
          <span className="text-xs text-slate-400">
            المستخدم النشط الحالي: <strong className="text-emerald-700">{currentUser.name}</strong> ({currentUser.roleTitle})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">الموظف</th>
                <th className="py-3 px-4">اسم المستخدم (Login)</th>
                <th className="py-3 px-4">الدور والصلاحية</th>
                <th className="py-3 px-4">البريد الإلكتروني</th>
                <th className="py-3 px-4">الهاتف</th>
                <th className="py-3 px-4 text-center">العملاء المسندون</th>
                <th className="py-3 px-4 text-center">الفرص النشطة</th>
                <th className="py-3 px-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleUsers.map((u) => {
                const assignedCusts = customers.filter((c) => c.assignedTo === u.id).length;
                const assignedOpps = opportunities.filter((o) => o.assignedTo === u.id).length;
                const isCurrent = u.id === currentUser.id;
                const canEditThisUser = isAdmin || isManager || isCurrent;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold">{u.name}</div>
                          {isCurrent && (
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                              حسابك الحالي
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {u.username}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.role === 'manager'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {u.roleTitle}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dir-ltr text-right">
                      {u.phone}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                      {assignedCusts}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">
                      {assignedOpps}
                    </td>

                    <td className="py-3.5 px-4 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Open Chat with this employee */}
                        {!isCurrent && onOpenChatWithUser && (
                          <button
                            onClick={() => onOpenChatWithUser(u.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1"
                            title="فتح محادثة وإرسال ملاحظات"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                            <span>محادثة</span>
                          </button>
                        )}

                        {/* Edit Button */}
                        {canEditThisUser && (
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 transition-colors flex items-center gap-1"
                            title="تعديل الحساب"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>تعديل</span>
                          </button>
                        )}

                        {/* Switch User Button (for testing) */}
                        {isManagerOrAdmin && (
                          <button
                            onClick={() => switchUser(u.id)}
                            disabled={isCurrent}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isCurrent
                                ? 'bg-emerald-50 text-emerald-800 cursor-default'
                                : 'bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700'
                            }`}
                            title="الدخول بهذا الحساب لتجربة صلاحياته"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>{isCurrent ? 'نشط' : 'تبديل'}</span>
                          </button>
                        )}

                        {/* Delete Button (Only for Admin, cannot delete user-1 or self) */}
                        {isAdmin && u.id !== 'user-1' && !isCurrent && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 text-xs md:text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900">
                <Edit3 className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-base">
                  {isManagerOrAdmin && editingUser.id !== currentUser.id
                    ? `تعديل حساب: ${editingUser.name}`
                    : 'تعديل حسابي الشخصي'}
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم الموظف</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم المستخدم (Login)</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">كلمة المرور الجديدة</label>
                  <input
                    type="text"
                    placeholder="اتركها أو أدخل جديدة"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              {/* Role selection editable by Admin */}
              {isAdmin && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    الدور والصلاحية (تحكم مدير النظام)
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => handleEditRoleChange(e.target.value as UserRole)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="admin">Admin (المدير العام ومدير النظام)</option>
                    <option value="manager">Manager (مدير التسويق والمبيعات)</option>
                    <option value="sales">Sales / Call Center (موظف مبيعات وتواصل)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">المسمى الوظيفي</label>
                <input
                  type="text"
                  value={editRoleTitle}
                  onChange={(e) => setEditRoleTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="editIsActive" className="text-slate-700 font-semibold cursor-pointer">
                    حساب نشط ومفعل
                  </label>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal: For Admin and Marketing Manager */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 text-xs md:text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">إنشاء حساب موظف جديد لشركة أكبيطرة</h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  اسم الموظف الكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: د. حسام النجار"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    اسم المستخدم <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="hussam"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    كلمة المرور <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  placeholder="name@akbitra-pharma.sy"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  placeholder="09XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الدور والصلاحية</label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="sales">Sales / Call Center (موظف مبيعات وتواصل)</option>
                  <option value="manager">Manager (مدير التسويق والمبيعات)</option>
                  {isAdmin && <option value="admin">Admin (المدير العام ومدير النظام)</option>}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  إنشاء المستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
