export type UserRole = 'admin' | 'manager' | 'sales';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  roleTitle: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  relatedCustomerId?: string;
  createdAt: string;
  read: boolean;
}

export type CustomerType = 
  | 'veterinarian'     // طبيب بيطري
  | 'clinic'           // عيادة بيطرية
  | 'pharmacy'         // صيدلية بيطرية
  | 'farm'             // مزرعة (أبقار/دواجن/أغنام)
  | 'breeder'          // مربي ثروة حيوانية
  | 'distributor'      // موزع أدوية بيطرية
  | 'trader'           // تاجر بيطري
  | 'company'          // شركة زراعية / بيطرية
  | 'other';           // أخرى

export type CustomerSource = 
  | 'whatsapp' 
  | 'facebook' 
  | 'phone' 
  | 'website' 
  | 'referral' 
  | 'field_visit' 
  | 'exhibition' 
  | 'other';

export type CustomerStatus = 'active' | 'followup' | 'new' | 'inactive';

export interface InterestedProduct {
  productId: string;
  interestLevel: 'hot' | 'warm' | 'inquiry'; // مهتم جداً | مهتم | استفسار
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  customerType: CustomerType;
  city: string;
  area?: string;
  assignedTo: string; // User ID
  source: CustomerSource;
  status: CustomerStatus;
  notes?: string;
  interestedProducts: InterestedProduct[];
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
}

export type ProductCategory = 
  | 'antibiotics'       // المضادات الحيوية
  | 'anti_inflammatory' // مضادات التهاب وحساسية
  | 'vitamins'          // فيتامينات / فيتامينات ومعادن
  | 'antiparasitics'    // مضادات الطفيليات
  | 'coccidiostats'     // مضادات كوكسيديا
  | 'analgesics'        // خافضات الحرارة ومسكنات الألم
  | 'calcium'           // محاليل كلسية
  | 'rumen_stimulant'   // منشط كرش
  | 'other';            // منتجات أخرى

export type PharmaceuticalForm = 
  | 'injection'         // حقن
  | 'oral_solution'     // شراب / محلول فموي
  | 'powder'            // بودرة
  | 'ointment'          // مراهم
  | 'bolus'             // بلعات
  | 'tablet';           // مضغوطات / تحاميل رحمية

export interface Product {
  id: string;
  name: string;
  code: string;
  category: ProductCategory;
  categoryAr: string;
  form: PharmaceuticalForm;
  formAr: string;
  targetAnimals: string[]; // أبقار, أغنام, دواجن, خيول
  activeIngredients?: string[]; // المواد الفعالة
  packaging: string;       // 100ml, 500ml, 1kg
  unitPrice: number;       // $
  description: string;
  isActive: boolean;
  createdAt: string;
}

export type OpportunityStage = 
  | 'new'          // جديد
  | 'contacted'    // تم التواصل
  | 'interested'   // مهتم
  | 'quotation'    // عرض سعر
  | 'won'          // تم البيع
  | 'lost';         // خسارة

export interface Opportunity {
  id: string;
  customerId: string;
  productId: string;
  assignedTo: string; // User ID
  title: string;
  stage: OpportunityStage;
  quantity: number;
  expectedValue: number; // $
  source: CustomerSource;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export type FollowUpType = 
  | 'call' 
  | 'whatsapp' 
  | 'visit' 
  | 'facebook' 
  | 'email' 
  | 'other';

export type FollowUpStatus = 'pending' | 'completed' | 'cancelled';

export interface FollowUp {
  id: string;
  customerId: string;
  opportunityId?: string;
  assignedTo: string; // User ID
  type: FollowUpType;
  dueDate: string;   // YYYY-MM-DD
  dueTime: string;   // HH:mm
  status: FollowUpStatus;
  notes: string;
  completedAt?: string;
  completionNotes?: string;
  createdAt: string;
}

export type ActivityType = 
  | 'customer_created'
  | 'opportunity_created'
  | 'note'
  | 'call'
  | 'whatsapp'
  | 'facebook'
  | 'email'
  | 'visit'
  | 'stage_change'
  | 'followup_done'
  | 'sale_recorded';

export interface Activity {
  id: string;
  customerId: string;
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  customerId: string;
  opportunityId?: string;
  productId: string;
  userId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  saleDate: string;
  notes?: string;
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  companyNameEn: string;
  slogan: string;
  currency: string;
  phone: string;
  email: string;
  city: string;
  address: string;
}
