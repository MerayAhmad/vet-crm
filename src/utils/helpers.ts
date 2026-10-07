import { 
  CustomerType, 
  CustomerStatus, 
  CustomerSource, 
  OpportunityStage, 
  FollowUpType, 
  ProductCategory,
  PharmaceuticalForm 
} from '../types';

export const CUSTOMER_TYPE_MAP: Record<CustomerType, { ar: string; color: string }> = {
  veterinarian: { ar: 'طبيب بيطري', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  clinic: { ar: 'عيادة بيطرية', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  pharmacy: { ar: 'صيدلية بيطرية', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  farm: { ar: 'مزرعة', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  breeder: { ar: 'مربي ماشية', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  distributor: { ar: 'موزع أدوية', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  trader: { ar: 'تاجر بيطري', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  company: { ar: 'شركة زراعية', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  other: { ar: 'أخرى', color: 'bg-slate-50 text-slate-600 border-slate-200' },
};

export const CUSTOMER_STATUS_MAP: Record<CustomerStatus, { ar: string; dotColor: string; textColor: string }> = {
  active: { ar: 'نشط', dotColor: 'bg-emerald-500', textColor: 'text-emerald-700' },
  followup: { ar: 'متابعة', dotColor: 'bg-amber-500', textColor: 'text-amber-700' },
  new: { ar: 'جديد', dotColor: 'bg-blue-500', textColor: 'text-blue-700' },
  inactive: { ar: 'غير نشط', dotColor: 'bg-slate-400', textColor: 'text-slate-500' },
};

export const SOURCE_MAP: Record<CustomerSource, { ar: string; iconName: string }> = {
  whatsapp: { ar: 'WhatsApp', iconName: 'MessageSquare' },
  facebook: { ar: 'Facebook', iconName: 'Share2' },
  phone: { ar: 'اتصال هاتفي', iconName: 'Phone' },
  website: { ar: 'الموقع الإلكتروني', iconName: 'Globe' },
  referral: { ar: 'توصية / إحالة', iconName: 'UserCheck' },
  field_visit: { ar: 'زيارة ميدانية', iconName: 'MapPin' },
  exhibition: { ar: 'معرض بيطري', iconName: 'Award' },
  other: { ar: 'أخرى', iconName: 'MoreHorizontal' },
};

export const STAGE_MAP: Record<OpportunityStage, { ar: string; color: string; bgSoft: string; border: string }> = {
  new: { ar: 'جديد', color: 'text-blue-700', bgSoft: 'bg-blue-50', border: 'border-blue-200' },
  contacted: { ar: 'تم التواصل', color: 'text-purple-700', bgSoft: 'bg-purple-50', border: 'border-purple-200' },
  interested: { ar: 'مهتم', color: 'text-amber-700', bgSoft: 'bg-amber-50', border: 'border-amber-200' },
  quotation: { ar: 'عرض سعر', color: 'text-indigo-700', bgSoft: 'bg-indigo-50', border: 'border-indigo-200' },
  won: { ar: 'تم البيع', color: 'text-emerald-700', bgSoft: 'bg-emerald-50', border: 'border-emerald-200' },
  lost: { ar: 'خسارة', color: 'text-rose-700', bgSoft: 'bg-rose-50', border: 'border-rose-200' },
};

export const FOLLOWUP_TYPE_MAP: Record<FollowUpType, { ar: string; icon: string }> = {
  call: { ar: 'اتصال هاتفي', icon: 'Phone' },
  whatsapp: { ar: 'WhatsApp', icon: 'MessageCircle' },
  visit: { ar: 'زيارة ميدانية', icon: 'MapPin' },
  facebook: { ar: 'Facebook', icon: 'Share2' },
  email: { ar: 'بريد إلكتروني', icon: 'Mail' },
  other: { ar: 'أخرى', icon: 'Clock' },
};

export const SYRIAN_CITIES = [
  'دمشق',
  'ريف دمشق',
  'حلب',
  'حمص',
  'حماة',
  'اللاذقية',
  'طرطوس',
  'درعا',
  'السويداء',
  'دير الزور',
  'الحسكة',
  'الرقة',
  'إدلب',
  'القنيطرة',
];

export function formatCurrency(amount: number, currency = '$'): string {
  return `${currency}${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatDateArabic(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-');
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} ${months[monthIndex] || month}`;
  } catch {
    return dateStr;
  }
}

export function formatRelativeDate(dateStr: string): { label: string; status: 'overdue' | 'today' | 'upcoming' } {
  if (!dateStr) return { label: '', status: 'upcoming' };
  const targetDate = new Date(dateStr.split('T')[0]);
  const today = new Date('2026-10-05'); // Context target date
  
  // Set both to midnight for exact day comparison
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return {
      label: daysAgo === 1 ? 'منذ يوم' : daysAgo === 2 ? 'منذ يومين' : `منذ ${daysAgo} أيام`,
      status: 'overdue',
    };
  } else if (diffDays === 0) {
    return { label: 'اليوم', status: 'today' };
  } else if (diffDays === 1) {
    return { label: 'غداً', status: 'upcoming' };
  } else {
    return { label: `خلال ${diffDays} أيام`, status: 'upcoming' };
  }
}

export function createWhatsAppUrl(phone: string, customerName = '', productName = ''): string {
  // Clean phone number (e.g. 0944... to international Syrian +963 or direct)
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('09')) {
    cleanPhone = '963' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('963') && cleanPhone.length === 9) {
    cleanPhone = '963' + cleanPhone;
  }
  
  const greeting = customerName ? `مرحباً ${customerName}، ` : 'مرحباً، ';
  const text = productName
    ? `${greeting}نتواصل معك من شركة أكبيطرة للأدوية البيطرية بخصوص منتج ${productName}. كيف يمكننا مساعدتك اليوم؟`
    : `${greeting}نتواصل معك من شركة أكبيطرة للأدوية البيطرية للاطمئنان على احتياجاتكم الدوائية والبيطرية.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function createPhoneUrl(phone: string): string {
  return `tel:${phone}`;
}
