import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageSquare, 
  User, 
  CheckCheck, 
  Clock, 
  Users, 
  Building, 
  Sparkles, 
  ShieldCheck,
  Search,
  Check
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { User as UserType } from '../types';
import { formatDateArabic } from '../utils/helpers';

interface InternalChatProps {
  initialPartnerId?: string;
  onSelectCustomer?: (customerId: string) => void;
}

export const InternalChat: React.FC<InternalChatProps> = ({
  initialPartnerId,
  onSelectCustomer,
}) => {
  const { 
    currentUser, 
    users, 
    chatMessages, 
    sendMessage, 
    markMessagesAsRead, 
    getConversation, 
    customers,
    isManagerOrAdmin 
  } = useCrm();

  // Chat partners list:
  // Managers & Admin can chat with any team member.
  // Regular employees can chat with Managers and Admin.
  const availablePartners: UserType[] = users.filter((u) => {
    if (u.id === currentUser.id) return false;
    if (isManagerOrAdmin) return true; // Manager/Admin can chat with everyone
    // Regular employee can chat with Admin and Managers
    return u.role === 'admin' || u.role === 'manager';
  });

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(() => {
    if (initialPartnerId && availablePartners.some((p) => p.id === initialPartnerId)) {
      return initialPartnerId;
    }
    return availablePartners[0]?.id || '';
  });

  const [newMessage, setNewMessage] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [partnerSearch, setPartnerSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedPartner = users.find((u) => u.id === selectedPartnerId);

  // Mark messages as read whenever viewing partner
  useEffect(() => {
    if (selectedPartnerId) {
      markMessagesAsRead(selectedPartnerId);
    }
  }, [selectedPartnerId, chatMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedPartnerId]);

  const activeConversation = selectedPartnerId ? getConversation(selectedPartnerId) : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartnerId) return;

    sendMessage(
      selectedPartnerId,
      newMessage.trim(),
      selectedCustomerId || undefined
    );

    setNewMessage('');
    setSelectedCustomerId('');
  };

  const handleQuickTemplate = (text: string) => {
    setNewMessage(text);
  };

  const filteredPartners = availablePartners.filter((p) =>
    p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
    p.roleTitle.toLowerCase().includes(partnerSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>الدردشة والتوجيهات الداخلية</span>
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
              محادثات سير العمل
            </span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {isManagerOrAdmin
              ? 'توجيه الملاحظات والتعليمات المباشرة لموظفي المبيعات والـ Call Center ومتابعة آلية سير العمل'
              : 'التواصل المباشر مع إدارة التسويق ومدير النظام لتلقي التوجيهات واعتماد عروض الأسعار'}
          </p>
        </div>
      </div>

      {/* Main Chat Box (2 Panes) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
        {/* Right Pane (RTL Start): Partners / Employees List */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-l border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
          <div className="p-3 border-b border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>زملاء العمل والمحادثات</span>
              <span className="font-mono text-slate-400 text-[11px]">{availablePartners.length} موظف</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="بحث عن موظف..."
                value={partnerSearch}
                onChange={(e) => setPartnerSearch(e.target.value)}
                className="w-full h-8 pr-8 pl-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {filteredPartners.map((partner) => {
              const partnerMessages = getConversation(partner.id);
              const lastMsg = partnerMessages[partnerMessages.length - 1];
              const unreadFromPartner = chatMessages.filter(
                (m) => m.senderId === partner.id && m.receiverId === currentUser.id && !m.read
              ).length;
              const isSelected = partner.id === selectedPartnerId;

              return (
                <button
                  key={partner.id}
                  onClick={() => setSelectedPartnerId(partner.id)}
                  className={`w-full p-2.5 rounded-xl text-right transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {partner.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate">
                        {partner.name}
                      </span>
                      {unreadFromPartner > 0 && (
                        <span className="h-4 min-w-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {unreadFromPartner}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10px] truncate mt-0.5 ${
                        isSelected ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      {partner.roleTitle}
                    </div>
                    {lastMsg && (
                      <p
                        className={`text-[11px] truncate mt-1 ${
                          isSelected ? 'text-white/90 font-medium' : 'text-slate-500'
                        }`}
                      >
                        {lastMsg.content}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Left Pane (RTL End): Active Conversation */}
        {selectedPartner ? (
          <div className="flex-1 flex flex-col bg-white min-h-0">
            {/* Conversation Header */}
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  {selectedPartner.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>{selectedPartner.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                        selectedPartner.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : selectedPartner.role === 'manager'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedPartner.roleTitle}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono dir-ltr text-right">
                    {selectedPartner.phone} · {selectedPartner.email}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                محادثة خاصة ومحفوظة
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {activeConversation.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">
                    لا توجد رسائل سابقة مع {selectedPartner.name}
                  </p>
                  <p className="text-[11px] max-w-sm">
                    ابدأ المحادثة بإرسال ملاحظاتك أو توجيهاتك بخصوص العملاء وسير العمل البيطري.
                  </p>
                </div>
              ) : (
                activeConversation.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;
                  const relatedCust = msg.relatedCustomerId
                    ? customers.find((c) => c.id === msg.relatedCustomerId)
                    : null;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-lg rounded-2xl p-3 text-xs shadow-xs space-y-1.5 ${
                          isMine
                            ? 'bg-emerald-700 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        {/* Reference to customer if any */}
                        {relatedCust && (
                          <div
                            onClick={() => onSelectCustomer?.(relatedCust.id)}
                            className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center justify-between cursor-pointer ${
                              isMine
                                ? 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-800'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <span>👤 إشارة إلى العميل: {relatedCust.name}</span>
                            <span className="underline">عرض الملف</span>
                          </div>
                        )}

                        <p className="leading-relaxed whitespace-pre-wrap text-xs md:text-sm">
                          {msg.content}
                        </p>

                        <div
                          className={`text-[10px] font-mono flex items-center justify-between pt-1 ${
                            isMine ? 'text-emerald-200' : 'text-slate-400'
                          }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMine && (
                            <span className="flex items-center gap-0.5">
                              <CheckCheck className="w-3 h-3" />
                              <span>{msg.read ? 'تمت القراءة' : 'تم الإرسال'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Guidance Templates & Quick Actions */}
            <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
              <span className="text-slate-400 font-bold whitespace-nowrap">قوالب سريعة:</span>
              <button
                type="button"
                onClick={() => handleQuickTemplate('يرجى متابعة العميل والتأكيد على عرض السعر ⚡')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg whitespace-nowrap transition-colors"
              >
                تأكيد عرض السعر ⚡
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplate('تم إرسال بروشور الدواء البيطري عبر WhatsApp للعميل ✓')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg whitespace-nowrap transition-colors"
              >
                إرسال بروشور الدواء ✓
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplate('العميل يطلب تسهيلات دفع 30 يوم لطلب 50 عبوة 📅')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg whitespace-nowrap transition-colors"
              >
                طلب تسهيل دفع 📅
              </button>
            </div>

            {/* Composer */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 space-y-2 shrink-0">
              {/* Optional customer tagging */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="h-7 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:outline-none"
                >
                  <option value="">-- إشارة إلى عميل بيطري (اختياري) --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
                {selectedCustomerId && (
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    ✓ سيتم ربط الرسالة بملف العميل
                  </span>
                )}
              </div>

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder={`اكتب ملاحظتك إلى ${selectedPartner.name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="h-10 px-5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>إرسال</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
            اختر موظفاً لبدء المحادثة معه
          </div>
        )}
      </div>
    </div>
  );
};
