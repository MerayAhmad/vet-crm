import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Phone, 
  MessageCircle, 
  Eye, 
  MapPin, 
  X,
  UserCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { Customer, CustomerType } from '../types';
import { 
  CUSTOMER_TYPE_MAP, 
  CUSTOMER_STATUS_MAP, 
  SYRIAN_CITIES, 
  createWhatsAppUrl, 
  formatDateArabic 
} from '../utils/helpers';

interface CustomersListProps {
  onSelectCustomer: (id: string) => void;
  onOpenNewCustomer: () => void;
}

export const CustomersList: React.FC<CustomersListProps> = ({
  onSelectCustomer,
  onOpenNewCustomer,
}) => {
  const { customers, users } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      // Search
      const matchesSearch =
        searchQuery.trim() === '' ||
        cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.phone.includes(searchQuery) ||
        cust.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cust.notes && cust.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      // Type
      const matchesType = selectedType === 'all' || cust.customerType === selectedType;

      // City
      const matchesCity = selectedCity === 'all' || cust.city === selectedCity;

      // User
      const matchesUser = selectedUser === 'all' || cust.assignedTo === selectedUser;

      // Status
      const matchesStatus = selectedStatus === 'all' || cust.status === selectedStatus;

      return matchesSearch && matchesType && matchesCity && matchesUser && matchesStatus;
    });
  }, [customers, searchQuery, selectedType, selectedCity, selectedUser, selectedStatus]);

  const hasActiveFilters =
    selectedType !== 'all' ||
    selectedCity !== 'all' ||
    selectedUser !== 'all' ||
    selectedStatus !== 'all' ||
    searchQuery !== '';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCity('all');
    setSelectedUser('all');
    setSelectedStatus('all');
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* 1. Header with title & Add Customer CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>دليل العملاء</span>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
              {filteredCustomers.length} عميل
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            إدارة الأطباء البيطريين، الصيدليات، المزارع والموزعين
          </p>
        </div>

        <button
          onClick={onOpenNewCustomer}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة عميل جديد</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="بحث بالاسم، رقم الهاتف، أو المدينة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pr-9 pl-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">كل أنواع العملاء</option>
              {Object.entries(CUSTOMER_TYPE_MAP).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.ar}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">كل المحافظات والمدن</option>
              {SYRIAN_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned User Filter */}
          <div>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full h-10 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">كل الموظفين</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.roleTitle})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills and Active filters reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium">الحالة:</span>
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedStatus === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🟢 نشط
            </button>
            <button
              onClick={() => setSelectedStatus('followup')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedStatus === 'followup'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🟡 متابعة
            </button>
            <button
              onClick={() => setSelectedStatus('new')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedStatus === 'new'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🔵 جديد
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>إلغاء الفلاتر</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">لا توجد نتائج مطابقة</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              جرب تغيير عبارة البحث أو إعادة تعيين الفلاتر لعرض العملاء المسجلين.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">العميل</th>
                  <th className="py-3.5 px-4">النوع</th>
                  <th className="py-3.5 px-4">المدينة والمنطقة</th>
                  <th className="py-3.5 px-4">رقم الهاتف</th>
                  <th className="py-3.5 px-4">الموظف المسؤول</th>
                  <th className="py-3.5 px-4">آخر تواصل</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-left">التواصل والإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => {
                  const assignedUser = users.find((u) => u.id === cust.assignedTo);
                  const typeObj = CUSTOMER_TYPE_MAP[cust.customerType] || CUSTOMER_TYPE_MAP.other;
                  const statusObj = CUSTOMER_STATUS_MAP[cust.status] || CUSTOMER_STATUS_MAP.new;

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-50/90 transition-colors group"
                    >
                      {/* Customer Name */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onSelectCustomer(cust.id)}
                          className="text-right group-hover:text-emerald-700 font-bold text-slate-900 transition-colors block"
                        >
                          <div className="text-sm font-bold">{cust.name}</div>
                          {cust.notes && (
                            <div className="text-[11px] text-slate-400 font-normal line-clamp-1 max-w-xs mt-0.5">
                              {cust.notes}
                            </div>
                          )}
                        </button>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${typeObj.color}`}>
                          {typeObj.ar}
                        </span>
                      </td>

                      {/* City */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        <div className="font-medium text-slate-800">{cust.city}</div>
                        {cust.area && <div className="text-[11px] text-slate-400">{cust.area}</div>}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-slate-700 dir-ltr text-right">
                        {cust.phone}
                      </td>

                      {/* Assigned Employee */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        <div className="font-medium text-slate-800">
                          {assignedUser?.name || 'غير مسند'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {assignedUser?.roleTitle}
                        </div>
                      </td>

                      {/* Last Contact Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono">
                        {cust.lastContactDate ? formatDateArabic(cust.lastContactDate) : 'لم يسجل'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${statusObj.dotColor}`}></span>
                          <span className={`font-semibold ${statusObj.textColor}`}>
                            {statusObj.ar}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp */}
                          <a
                            href={createWhatsAppUrl(cust.phone, cust.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="محادثة واتساب سريعة"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* Phone */}
                          <a
                            href={`tel:${cust.phone}`}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="اتصال هاتفي"
                          >
                            <Phone className="w-4 h-4" />
                          </a>

                          {/* View Profile */}
                          <button
                            onClick={() => onSelectCustomer(cust.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                          >
                            <span>الملف</span>
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
