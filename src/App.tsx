import React, { useState } from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CustomersList } from './components/CustomersList';
import { CustomerDetails } from './components/CustomerDetails';
import { CustomerModal } from './components/CustomerModal';
import { Pipeline } from './components/Pipeline';
import { OpportunityModal } from './components/OpportunityModal';
import { FollowUps } from './components/FollowUps';
import { FollowUpModal } from './components/FollowUpModal';
import { ProductsList } from './components/ProductsList';
import { Reports } from './components/Reports';
import { UsersManagement } from './components/UsersManagement';
import { SettingsView } from './components/SettingsView';
import { InternalChat } from './components/InternalChat';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CRM Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 text-center font-sans" dir="rtl">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-black text-slate-900">حدث تنبيه في النظام</h2>
            <p className="text-xs text-slate-500">
              يرجى تحديث الصفحة لمتابعة العمل في نظام شركة أكبيطرة للأدوية البيطرية.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              تحديث الصفحة الآن
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AuthenticatedApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeChatPartnerId, setActiveChatPartnerId] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [modalCustomerTarget, setModalCustomerTarget] = useState<string | undefined>(undefined);

  // Handlers
  const handleOpenNewCustomer = () => {
    setIsCustomerModalOpen(true);
  };

  const handleOpenNewOpportunity = (customerId?: string) => {
    setModalCustomerTarget(customerId);
    setIsOpportunityModalOpen(true);
  };

  const handleOpenNewFollowUp = (customerId?: string) => {
    setModalCustomerTarget(customerId);
    setIsFollowUpModalOpen(true);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleBackToCustomers = () => {
    setSelectedCustomerId(null);
  };

  const handleNavigateTab = (tab: string) => {
    setSelectedCustomerId(null);
    if (tab !== 'chat') {
      setActiveChatPartnerId(undefined);
    }
    setActiveTab(tab);
  };

  const handleOpenChatWithUser = (userId: string) => {
    setSelectedCustomerId(null);
    setActiveChatPartnerId(userId);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex" dir="rtl">
      {/* Sidebar */}
      <Sidebar
        activeTab={selectedCustomerId ? 'customers' : activeTab}
        setActiveTab={handleNavigateTab}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenNewCustomer={handleOpenNewCustomer}
          onOpenNewOpportunity={() => handleOpenNewOpportunity()}
          onOpenNewFollowUp={() => handleOpenNewFollowUp()}
          onSelectCustomer={handleSelectCustomer}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onNavigateTab={handleNavigateTab}
          activeTab={activeTab}
        />

        {/* Dynamic Content Body */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {selectedCustomerId ? (
            <CustomerDetails
              customerId={selectedCustomerId}
              onBack={handleBackToCustomers}
              onOpenNewOpportunityForCustomer={(id) => handleOpenNewOpportunity(id)}
              onOpenNewFollowUpForCustomer={(id) => handleOpenNewFollowUp(id)}
              onOpenChatWithUser={handleOpenChatWithUser}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  onOpenNewCustomer={handleOpenNewCustomer}
                  onOpenNewOpportunity={() => handleOpenNewOpportunity()}
                  onOpenNewFollowUp={() => handleOpenNewFollowUp()}
                  onNavigateTab={handleNavigateTab}
                  onSelectCustomer={handleSelectCustomer}
                />
              )}

              {activeTab === 'customers' && (
                <CustomersList
                  onSelectCustomer={handleSelectCustomer}
                  onOpenNewCustomer={handleOpenNewCustomer}
                />
              )}

              {activeTab === 'pipeline' && (
                <Pipeline
                  onOpenNewOpportunity={() => handleOpenNewOpportunity()}
                  onSelectCustomer={handleSelectCustomer}
                  onOpenNewFollowUpForCustomer={(id) => handleOpenNewFollowUp(id)}
                />
              )}

              {activeTab === 'followups' && (
                <FollowUps
                  onOpenNewFollowUp={() => handleOpenNewFollowUp()}
                  onSelectCustomer={handleSelectCustomer}
                />
              )}

              {activeTab === 'chat' && (
                <InternalChat
                  initialPartnerId={activeChatPartnerId}
                  onSelectCustomer={handleSelectCustomer}
                />
              )}

              {activeTab === 'products' && (
                <ProductsList
                  onSelectCustomer={handleSelectCustomer}
                  onOpenNewOpportunity={() => handleOpenNewOpportunity()}
                />
              )}

              {activeTab === 'reports' && <Reports />}

              {activeTab === 'users' && (
                <UsersManagement onOpenChatWithUser={handleOpenChatWithUser} />
              )}

              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onCreated={(newCustId) => {
          setSelectedCustomerId(newCustId);
        }}
      />

      <OpportunityModal
        isOpen={isOpportunityModalOpen}
        onClose={() => {
          setIsOpportunityModalOpen(false);
          setModalCustomerTarget(undefined);
        }}
        defaultCustomerId={modalCustomerTarget}
      />

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setModalCustomerTarget(undefined);
        }}
        defaultCustomerId={modalCustomerTarget}
      />
    </div>
  );
};

const MainApp: React.FC = () => {
  const { isAuthenticated } = useCrm();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AuthenticatedApp />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <CrmProvider>
        <MainApp />
      </CrmProvider>
    </ErrorBoundary>
  );
}
