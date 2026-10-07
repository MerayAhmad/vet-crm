import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Customer,
  Product,
  Opportunity,
  OpportunityStage,
  FollowUp,
  Activity,
  Sale,
  CompanySettings,
  ChatMessage,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_OPPORTUNITIES,
  INITIAL_FOLLOW_UPS,
  INITIAL_ACTIVITIES,
  INITIAL_SALES,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_CHAT_MESSAGES,
} from '../mockData';

interface CrmContextType {
  // Authentication & Role
  users: User[];
  visibleUsers: User[];
  currentUser: User;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  isManagerOrAdmin: boolean;
  isAdmin: boolean;
  isManager: boolean;
  canManageUsers: boolean;
  roleFilterApplied: boolean;
  setRoleFilterApplied: (applied: boolean) => void;

  // Internal In-App Chat
  chatMessages: ChatMessage[];
  sendMessage: (receiverId: string, content: string, relatedCustomerId?: string) => ChatMessage;
  markMessagesAsRead: (otherUserId: string) => void;
  getConversation: (otherUserId: string) => ChatMessage[];
  unreadChatCount: number;

  // Customers
  customers: Customer[];
  allCustomers: Customer[];
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;

  // Products
  products: Product[];
  addProduct: (data: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, data: Partial<Product>) => void;
  getProductById: (id: string) => Product | undefined;

  // Opportunities / Pipeline
  opportunities: Opportunity[];
  allOpportunities: Opportunity[];
  addOpportunity: (data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => Opportunity;
  updateOpportunityStage: (id: string, stage: OpportunityStage) => void;
  updateOpportunity: (id: string, data: Partial<Opportunity>) => void;
  markOpportunityWon: (id: string) => void;
  deleteOpportunity: (id: string) => void;

  // Follow-ups
  followUps: FollowUp[];
  allFollowUps: FollowUp[];
  addFollowUp: (data: Omit<FollowUp, 'id' | 'createdAt'>) => FollowUp;
  completeFollowUp: (id: string, completionNotes?: string) => void;
  cancelFollowUp: (id: string) => void;

  // Activities & Timeline
  activities: Activity[];
  getCustomerActivities: (customerId: string) => Activity[];
  addActivity: (data: Omit<Activity, 'id' | 'createdAt'>) => Activity;

  // Sales
  sales: Sale[];
  recordSale: (data: Omit<Sale, 'id' | 'createdAt'>) => Sale;

  // Settings
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  resetToDemoData: () => void;
  exportDataAsJson: () => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'vetcrm_users_v3',
  AUTH_USER_ID: 'vetcrm_auth_user_id_v2',
  CURRENT_USER_ID: 'vetcrm_current_user_id_v2',
  CUSTOMERS: 'vetcrm_customers_v2',
  PRODUCTS: 'vetcrm_products_v2',
  OPPORTUNITIES: 'vetcrm_opportunities_v2',
  FOLLOW_UPS: 'vetcrm_followups_v2',
  ACTIVITIES: 'vetcrm_activities_v2',
  SALES: 'vetcrm_sales_v2',
  SETTINGS: 'vetcrm_settings_v1',
  ROLE_FILTER: 'vetcrm_role_filter_v1',
  CHAT_MESSAGES: 'vetcrm_chat_messages_v2',
};

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage or fallback to mockData
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    let loadedUsers: User[] = saved ? JSON.parse(saved) : INITIAL_USERS;
    // Migration: ensure user-1 is 'مرعي الاحمد' and all users have usernames/passwords
    loadedUsers = loadedUsers.map((u) => {
      if (u.id === 'user-1') {
        return {
          ...u,
          username: u.username || 'meray',
          password: u.password || '123',
          name: 'مرعي الاحمد',
          role: 'admin' as const,
          roleTitle: 'المدير العام ومدير النظام',
          email: 'meray@akbitra-pharma.sy',
        };
      }
      if (u.id === 'user-2') {
        return { ...u, username: u.username || 'sara', password: u.password || '123' };
      }
      if (u.id === 'user-3') {
        return { ...u, username: u.username || 'ahmad', password: u.password || '123' };
      }
      if (u.id === 'user-4') {
        return { ...u, username: u.username || 'mohammed', password: u.password || '123' };
      }
      return {
        ...u,
        username: u.username || `user_${u.id.replace(/[^a-zA-Z0-9]/g, '')}`,
        password: u.password || '123',
      };
    });
    return loadedUsers;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const authId = localStorage.getItem(STORAGE_KEYS.AUTH_USER_ID);
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return authId || savedId || 'user-1';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const hasSession = sessionStorage.getItem('vetcrm_session_active') === 'true';
    const authId = localStorage.getItem(STORAGE_KEYS.AUTH_USER_ID);
    return Boolean(hasSession && authId);
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  const [roleFilterApplied, setRoleFilterApplied] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE_FILTER);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [allCustomers, setAllCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
    return saved ? JSON.parse(saved) : INITIAL_OPPORTUNITIES;
  });

  const [allFollowUps, setAllFollowUps] = useState<FollowUp[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
    return saved ? JSON.parse(saved) : INITIAL_FOLLOW_UPS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    let settings: CompanySettings = saved ? JSON.parse(saved) : INITIAL_COMPANY_SETTINGS;
    // Migration: ensure company name is 'شركة أكبيطرة للأدوية البيطرية'
    if (settings.companyName.includes('النماء') || !settings.companyName.includes('أكبيطرة')) {
      settings = {
        ...settings,
        companyName: 'شركة أكبيطرة للأدوية البيطرية',
        companyNameEn: 'Akbitra Veterinary Pharma',
        email: 'info@akbitra-pharma.sy',
      };
    }
    return settings;
  });

  // Current user object
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const isAdmin = currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager';
  const isManagerOrAdmin = currentUser.role === 'admin' || currentUser.role === 'manager';
  const canManageUsers = isManagerOrAdmin; // Both Admin and Manager can create and manage users

  // Role-Based Visibility:
  // - Admin (مدير النظام مرعي الاحمد) and Manager (مدير التسويق) can see ALL users, customers, opportunities, and follow-ups.
  // - Sales / Call Center employees see ONLY their assigned customers, opportunities, follow-ups, and their own user info.
  const customers = isManagerOrAdmin
    ? allCustomers
    : allCustomers.filter((c) => c.assignedTo === currentUser.id);

  const opportunities = isManagerOrAdmin
    ? allOpportunities
    : allOpportunities.filter((o) => o.assignedTo === currentUser.id);

  const followUps = isManagerOrAdmin
    ? allFollowUps
    : allFollowUps.filter((f) => f.assignedTo === currentUser.id);

  const visibleUsers = isManagerOrAdmin
    ? users
    : users.filter((u) => u.id === currentUser.id);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(allCustomers));
  }, [allCustomers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(allOpportunities));
  }, [allOpportunities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(allFollowUps));
  }, [allFollowUps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(companySettings));
  }, [companySettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE_FILTER, JSON.stringify(roleFilterApplied));
  }, [roleFilterApplied]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Authentication Actions
  const login = (identifier: string, pass: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    const matchedUser = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === cleanId) ||
        (u.email && u.email.toLowerCase() === cleanId)
    );

    if (!matchedUser) {
      return { success: false, error: 'اسم المستخدم أو البريد الإلكتروني غير مسجل في النظام' };
    }

    const expectedPass = matchedUser.password || '123';
    if (cleanPass !== expectedPass) {
      return { success: false, error: 'كلمة المرور غير صحيحة، يرجى إعادة المحاولة' };
    }

    if (!matchedUser.isActive) {
      return { success: false, error: 'هذا الحساب معطل حالياً من قبل إدارة النظام' };
    }

    setCurrentUserId(matchedUser.id);
    sessionStorage.setItem('vetcrm_session_active', 'true');
    localStorage.setItem(STORAGE_KEYS.AUTH_USER_ID, matchedUser.id);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, matchedUser.id);
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    sessionStorage.removeItem('vetcrm_session_active');
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER_ID);
    setIsAuthenticated(false);
  };

  // Chat Actions
  const sendMessage = (receiverId: string, content: string, relatedCustomerId?: string): ChatMessage => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      content: content.trim(),
      relatedCustomerId,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  const markMessagesAsRead = (otherUserId: string) => {
    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.senderId === otherUserId && msg.receiverId === currentUser.id
          ? { ...msg, read: true }
          : msg
      )
    );
  };

  const getConversation = (otherUserId: string) => {
    return chatMessages
      .filter(
        (m) =>
          (m.senderId === currentUser.id && m.receiverId === otherUserId) ||
          (m.senderId === otherUserId && m.receiverId === currentUser.id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const unreadChatCount = chatMessages.filter(
    (m) => m.receiverId === currentUser.id && !m.read
  ).length;

  // Actions
  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER_ID, userId);
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)));
  };

  const deleteUser = (id: string) => {
    if (id === 'user-1' || id === currentUserId) return; // Prevent deleting main admin or self
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
    const nowStr = new Date().toISOString().split('T')[0];
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      createdAt: nowStr,
      updatedAt: nowStr,
      lastContactDate: nowStr,
    };
    setAllCustomers((prev) => [newCustomer, ...prev]);

    // Record activity
    addActivity({
      customerId: newCustomer.id,
      userId: currentUser.id,
      type: 'customer_created',
      title: 'تم إنشاء العميل',
      description: `تمت إضافة العميل ${newCustomer.name} (${newCustomer.city}) إلى النظام بواسطة ${currentUser.name}.`,
    });

    return newCustomer;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    const nowStr = new Date().toISOString().split('T')[0];
    setAllCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updatedAt: nowStr } : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setAllCustomers((prev) => prev.filter((c) => c.id !== id));
    setAllOpportunities((prev) => prev.filter((o) => o.customerId !== id));
    setAllFollowUps((prev) => prev.filter((f) => f.customerId !== id));
  };

  const getCustomerById = (id: string) => {
    return allCustomers.find((c) => c.id === id);
  };

  const addProduct = (data: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  const addOpportunity = (data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>): Opportunity => {
    const nowStr = new Date().toISOString().split('T')[0];
    const newOpp: Opportunity = {
      ...data,
      id: `opp-${Date.now()}`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    setAllOpportunities((prev) => [newOpp, ...prev]);

    // Record activity on customer
    const product = products.find((p) => p.id === newOpp.productId);
    addActivity({
      customerId: newOpp.customerId,
      userId: currentUser.id,
      type: 'opportunity_created',
      title: 'إنشاء فرصة بيع جديدة',
      description: `تم إنشاء فرصة بيع: ${newOpp.title} (${product?.name || 'منتج بيطري'}) بقيمة متوقعة $${newOpp.expectedValue}.`,
    });

    return newOpp;
  };

  const updateOpportunityStage = (id: string, stage: OpportunityStage) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const opp = allOpportunities.find((o) => o.id === id);
    if (!opp) return;

    const oldStage = opp.stage;
    const isWon = stage === 'won';

    setAllOpportunities((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              stage,
              updatedAt: nowStr,
              closedAt: isWon ? nowStr : o.closedAt,
            }
          : o
      )
    );

    // Stage translation for activity log
    const stageNames: Record<OpportunityStage, string> = {
      new: 'جديد',
      contacted: 'تم التواصل',
      interested: 'مهتم',
      quotation: 'عرض سعر',
      won: 'تم البيع بنجاح 🎉',
      lost: 'خسارة',
    };

    addActivity({
      customerId: opp.customerId,
      userId: currentUser.id,
      type: 'stage_change',
      title: `تحديث مرحلة الفرصة`,
      description: `تم نقل الفرصة "${opp.title}" من [${stageNames[oldStage]}] إلى [${stageNames[stage]}].`,
    });

    // If won, also create a sales record if not already recorded
    if (isWon && oldStage !== 'won') {
      const prod = products.find((p) => p.id === opp.productId);
      const unitPrice = prod?.unitPrice || opp.expectedValue / (opp.quantity || 1);
      recordSale({
        customerId: opp.customerId,
        opportunityId: opp.id,
        productId: opp.productId,
        userId: opp.assignedTo,
        quantity: opp.quantity,
        unitPrice: unitPrice,
        totalAmount: opp.expectedValue,
        saleDate: nowStr,
        notes: `مبيعات مسجلة تلقائياً عن طريق إتمام الفرصة: ${opp.title}`,
      });
    }
  };

  const updateOpportunity = (id: string, data: Partial<Opportunity>) => {
    const nowStr = new Date().toISOString().split('T')[0];
    setAllOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...data, updatedAt: nowStr } : o))
    );
  };

  const markOpportunityWon = (id: string) => {
    updateOpportunityStage(id, 'won');
  };

  const deleteOpportunity = (id: string) => {
    setAllOpportunities((prev) => prev.filter((o) => o.id !== id));
  };

  const addFollowUp = (data: Omit<FollowUp, 'id' | 'createdAt'>): FollowUp => {
    const nowStr = new Date().toISOString().split('T')[0];
    const newFollowUp: FollowUp = {
      ...data,
      id: `flw-${Date.now()}`,
      createdAt: nowStr,
    };
    setAllFollowUps((prev) => [newFollowUp, ...prev]);

    // Record activity
    addActivity({
      customerId: newFollowUp.customerId,
      userId: currentUser.id,
      type: 'note',
      title: 'جدولة متابعة جديدة',
      description: `تمت جدولة متابعة بتاريخ ${newFollowUp.dueDate} الساعة ${newFollowUp.dueTime} (${newFollowUp.type}): ${newFollowUp.notes}`,
    });

    return newFollowUp;
  };

  const completeFollowUp = (id: string, completionNotes?: string) => {
    const flw = allFollowUps.find((f) => f.id === id);
    if (!flw) return;

    const nowIso = new Date().toISOString();
    setAllFollowUps((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: 'completed',
              completedAt: nowIso,
              completionNotes: completionNotes || 'تمت المتابعة بنجاح',
            }
          : f
      )
    );

    // Record in activity timeline
    addActivity({
      customerId: flw.customerId,
      userId: currentUser.id,
      type: 'followup_done',
      title: 'إنجاز متابعة ✓',
      description: `تم إنجاز المتابعة المجدولة (${flw.type}). ملاحظات الإنجاز: ${completionNotes || 'تمت المتابعة والتأكيد مع العميل.'}`,
    });

    // Update customer last contact date
    updateCustomer(flw.customerId, {
      lastContactDate: new Date().toISOString().split('T')[0],
      status: 'active',
    });
  };

  const cancelFollowUp = (id: string) => {
    setAllFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'cancelled' } : f))
    );
  };

  const getCustomerActivities = (customerId: string) => {
    return activities
      .filter((a) => a.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const addActivity = (data: Omit<Activity, 'id' | 'createdAt'>): Activity => {
    const newActivity: Activity = {
      ...data,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev]);
    return newActivity;
  };

  const recordSale = (data: Omit<Sale, 'id' | 'createdAt'>): Sale => {
    const newSale: Sale = {
      ...data,
      id: `sale-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSales((prev) => [newSale, ...prev]);

    // Record activity
    const prod = products.find((p) => p.id === newSale.productId);
    addActivity({
      customerId: newSale.customerId,
      userId: newSale.userId,
      type: 'sale_recorded',
      title: 'تسجيل مبيعات جديدة',
      description: `تم تسجيل بيع ${newSale.quantity} عبوة من ${prod?.name || 'منتج بيطري'} بقيمة إجمالية $${newSale.totalAmount}.`,
    });

    return newSale;
  };

  const updateCompanySettings = (settings: Partial<CompanySettings>) => {
    setCompanySettings((prev) => ({ ...prev, ...settings }));
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.OPPORTUNITIES);
    localStorage.removeItem(STORAGE_KEYS.FOLLOW_UPS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);

    setUsers(INITIAL_USERS);
    setCurrentUserId('user-1');
    setAllCustomers(INITIAL_CUSTOMERS);
    setProducts(INITIAL_PRODUCTS);
    setAllOpportunities(INITIAL_OPPORTUNITIES);
    setAllFollowUps(INITIAL_FOLLOW_UPS);
    setActivities(INITIAL_ACTIVITIES);
    setSales(INITIAL_SALES);
    setCompanySettings(INITIAL_COMPANY_SETTINGS);
  };

  const exportDataAsJson = () => {
    const exportObject = {
      exportedAt: new Date().toISOString(),
      company: companySettings,
      users,
      customers: allCustomers,
      products,
      opportunities: allOpportunities,
      followUps: allFollowUps,
      activities,
      sales,
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vet-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CrmContext.Provider
      value={{
        users,
        visibleUsers,
        currentUser,
        isAuthenticated,
        login,
        logout,
        switchUser,
        addUser,
        updateUser,
        deleteUser,
        isAdmin,
        isManager,
        isManagerOrAdmin,
        canManageUsers,
        roleFilterApplied,
        setRoleFilterApplied,
        chatMessages,
        sendMessage,
        markMessagesAsRead,
        getConversation,
        unreadChatCount,
        customers,
        allCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
        products,
        addProduct,
        updateProduct,
        getProductById,
        opportunities,
        allOpportunities,
        addOpportunity,
        updateOpportunityStage,
        updateOpportunity,
        markOpportunityWon,
        deleteOpportunity,
        followUps,
        allFollowUps,
        addFollowUp,
        completeFollowUp,
        cancelFollowUp,
        activities,
        getCustomerActivities,
        addActivity,
        sales,
        recordSale,
        companySettings,
        updateCompanySettings,
        resetToDemoData,
        exportDataAsJson,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = (): CrmContextType => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
