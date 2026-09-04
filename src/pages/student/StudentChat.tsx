import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StudentShellWrapper } from './StudentShellWrapper';
import { chatApi, Conversation, ChatContact, ChatMessage } from '../../api/chat.api';
import { useSocket, SocketMessage } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { Send, MessageCircle, Search, ArrowLeft, CheckCheck } from 'lucide-react';

export const StudentChat: React.FC = () => {
  const { user } = useAuth();
  const { connected, sendMessage, markRead, onNewMessage, onMessageSent, onMessagesRead } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [text, setText] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await chatApi.getConversations();
      setConversations(res.data || []);
    } catch (e) { console.error('Failed to fetch conversations:', e); }
    finally { setLoading(false); }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      setContactsLoading(true);
      const res = await chatApi.getContacts();
      setContacts(res.data || []);
    } catch (e) { console.error('Failed to fetch contacts:', e); }
    finally { setContactsLoading(false); }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const openConversation = useCallback(async (conv: Conversation) => {
    setActiveConversation(conv);
    setActiveMessages(conv.messages || []);
    setShowContacts(false);
    try {
      await chatApi.markAsRead(conv._id);
      markRead(conv._id);
      setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, unreadCountStudent: 0 } : c));
    } catch (e) { /* ignore */ }
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [markRead]);

  const startConversation = useCallback(async (contact: ChatContact) => {
    try {
      const res = await chatApi.createConversation(contact._id);
      setActiveConversation(res.data);
      setActiveMessages(res.data.messages || []);
      setShowContacts(false);
      setConversations(prev => {
        if (prev.some(c => c._id === res.data._id)) return prev;
        return [res.data, ...prev];
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'فشل بدء المحادثة');
    }
  }, []);

  const handleSend = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || !activeConversation) return;
    const receiverId = activeConversation.teacher._id;
    const tempId = `temp-${Date.now()}`;
    const msg: ChatMessage = {
      _id: tempId,
      sender: user?.id || '',
      text: text.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setActiveMessages(prev => [...prev, msg]);
    setText('');
    sendMessage({ conversationId: activeConversation._id, text: msg.text, receiverId });
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [text, activeConversation, user?.id, sendMessage]);

  useEffect(() => {
    return onNewMessage((msg: SocketMessage) => {
      if (activeConversation && msg.conversationId === activeConversation._id) {
        setActiveMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, { _id: msg._id, sender: msg.sender, text: msg.text, read: msg.read, createdAt: msg.createdAt }];
        });
        markRead(activeConversation._id);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
      setConversations(prev => prev.map(c => {
        if (c._id === msg.conversationId) {
          return { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt, unreadCountStudent: activeConversation?._id === msg.conversationId ? 0 : (c.unreadCountStudent || 0) + 1 };
        }
        return c;
      }));
    });
  }, [onNewMessage, activeConversation, markRead]);

  useEffect(() => {
    return onMessageSent((msg: SocketMessage) => {
      setActiveMessages(prev => prev.map(m => m._id === `temp-${msg._id}` || m._id.startsWith('temp-') ? { ...m, _id: msg._id, read: msg.read, createdAt: msg.createdAt } : m));
      setConversations(prev => prev.map(c => c._id === msg.conversationId ? { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt } : c));
    });
  }, [onMessageSent]);

  useEffect(() => {
    return onMessagesRead(() => {
      setActiveMessages(prev => prev.map(m => ({ ...m, read: true })));
    });
  }, [onMessagesRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOtherParticipant = (conv: Conversation) => conv.teacher;

  return (
    <StudentShellWrapper>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">المحادثات</h1>
          <p className="text-sm text-muted-foreground">تواصل مع مدرسيك</p>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <span className="flex items-center gap-1 text-xs text-success"><span className="size-2 rounded-full bg-success" /> متصل</span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-muted-foreground" /> غير متصل</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Conversations sidebar */}
        <aside className="flex flex-col rounded-2xl border border-border bg-card shadow-soft" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="border-b border-border p-3">
            <button
              onClick={() => { setShowContacts(true); fetchContacts(); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              <MessageCircle className="size-4" /> محادثة جديدة
            </button>
          </div>

          {showContacts ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="border-b border-border p-2">
                <button onClick={() => setShowContacts(false)} className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                  <ArrowLeft className="size-3" /> رجوع للمحادثات
                </button>
                <div className="relative">
                  <Search className="absolute right-2 top-2.5 size-4 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="بحث عن مدرس..."
                    className="w-full rounded-lg border border-border bg-background pr-8 pl-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {contactsLoading ? <div className="flex justify-center py-8"><Loader text="جاري التحميل..." /></div> : filteredContacts.length > 0 ? (
                  filteredContacts.map(c => (
                    <button
                      key={c._id}
                      onClick={() => startConversation(c)}
                      className="flex w-full items-center gap-3 border-b border-border p-3 text-right hover:bg-muted/50"
                    >
                      <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {c.name?.charAt(0)?.toUpperCase() || 'T'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.course || c.email}</p>
                      </div>
                    </button>
                  ))
                ) : <p className="p-4 text-center text-sm text-muted-foreground">لا يوجد مدرسون</p>}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {loading ? <div className="flex justify-center py-8"><Loader text="جاري التحميل..." /></div> : conversations.length > 0 ? (
                conversations.map(conv => {
                  const other = getOtherParticipant(conv);
                  const isActive = activeConversation?._id === conv._id;
                  return (
                    <button
                      key={conv._id}
                      onClick={() => openConversation(conv)}
                      className={`flex w-full items-center gap-3 border-b border-border p-3 text-right transition-colors ${isActive ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                    >
                      <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {other?.name?.charAt(0)?.toUpperCase() || 'T'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-bold">{other?.name || 'مدرس'}</p>
                          {conv.unreadCountStudent > 0 && (
                            <span className="flex-shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{conv.unreadCountStudent}</span>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{conv.lastMessage || 'لا توجد رسائل'}</p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="mb-3 size-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">لا توجد محادثات بعد</p>
                  <p className="mt-1 text-xs text-muted-foreground">ابدأ محادثة جديدة مع مدرسك</p>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Chat window */}
        <section className="flex flex-col rounded-2xl border border-border bg-card shadow-soft" style={{ height: 'calc(100vh - 200px)' }}>
          {activeConversation ? (
            <>
              <div className="flex items-center gap-3 border-b border-border p-3">
                <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {activeConversation.teacher?.name?.charAt(0)?.toUpperCase() || 'T'}
                </span>
                <div>
                  <p className="text-sm font-bold">{activeConversation.teacher?.name || 'مدرس'}</p>
                  <p className="text-xs text-muted-foreground">{activeConversation.teacher?.email}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {activeMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center">
                    <p className="text-sm text-muted-foreground">ابدأ المحادثة بإرسال رسالة</p>
                  </div>
                ) : (
                  activeMessages.map((msg, i) => {
                    const isMe = msg.sender === user?.id || msg.sender?._id === user?.id;
                    return (
                      <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p>{msg.text}</p>
                          <div className={`mt-1 flex items-center gap-1 text-[10px] ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                            {isMe && msg.read && <CheckCheck className="size-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-3">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="اكتب رسالة..."
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button type="submit" disabled={!text.trim()} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60">
                  <Send className="size-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <MessageCircle className="mb-4 size-16 text-muted-foreground" />
              <h3 className="text-lg font-bold">اختر محادثة</h3>
              <p className="mt-1 text-sm text-muted-foreground">اختر محادثة من القائمة أو ابدأ واحدة جديدة</p>
            </div>
          )}
        </section>
      </div>
    </StudentShellWrapper>
  );
};
