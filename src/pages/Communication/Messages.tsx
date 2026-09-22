// src/pages/Communication/Messages.tsx
import React, { useMemo, useState } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Inbox,
  Users,
  User as UserIcon,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { mockUsers } from '../../mocks/users';

// ============================================
// TYPES + SEED
// ============================================
interface Message {
  id: string;
  fromId: string;
  toId: string;
  body: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  userId: string;
  messages: Message[];
}

const seedMessages: Message[] = [
  {
    id: 'msg-1',
    fromId: 'u-admin-1',
    toId: 'u-prof-1',
    body: 'Hi Prof. Reyes, please confirm your availability for Friday. I want to add IT305 to your schedule.',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'msg-2',
    fromId: 'u-prof-1',
    toId: 'u-admin-1',
    body: 'Good morning! Friday afternoon is free. Anytime between 1:00 PM and 5:00 PM works for me.',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-3',
    fromId: 'u-admin-1',
    toId: 'u-prof-1',
    body: 'Perfect. I will schedule IT305 for 1:00–4:00 PM on Friday in Room 102.',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'msg-4',
    fromId: 'u-staff-1',
    toId: 'u-admin-1',
    body: 'Admin, we have 12 pending enrollment applications. Please review them when you have time.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'msg-5',
    fromId: 'u-prof-2',
    toId: 'u-admin-1',
    body: 'Requesting to move my Tuesday class to Wednesday due to a conflict. Please advise.',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

// ============================================
// MAIN
// ============================================
export const Messages: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [composerText, setComposerText] = useState('');

  const currentUserId = user?.id ?? 'u-admin-1';

  // Build conversations for current user
  const conversations = useMemo<Conversation[]>(() => {
    const relevant = messages.filter(
      (m) => m.fromId === currentUserId || m.toId === currentUserId
    );

    const byOther = new Map<string, Message[]>();
    for (const m of relevant) {
      const otherId = m.fromId === currentUserId ? m.toId : m.fromId;
      if (!byOther.has(otherId)) byOther.set(otherId, []);
      byOther.get(otherId)!.push(m);
    }

    const list: Conversation[] = [];
    for (const [userId, msgs] of byOther.entries()) {
      list.push({
        userId,
        messages: msgs.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      });
    }

    // Sort conversations by latest message
    list.sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.createdAt ?? '';
      const bLast = b.messages[b.messages.length - 1]?.createdAt ?? '';
      return bLast.localeCompare(aLast);
    });

    return list;
  }, [messages, currentUserId]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const u = mockUsers.find((x) => x.id === c.userId);
      const name = `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.toLowerCase();
      return name.includes(q);
    });
  }, [conversations, searchQuery]);

  const activeConversation = useMemo(() => {
    if (!selectedUserId) {
      return filteredConversations[0] ?? null;
    }
    return conversations.find((c) => c.userId === selectedUserId) ?? null;
  }, [selectedUserId, conversations, filteredConversations]);

  const otherUser = activeConversation
    ? mockUsers.find((u) => u.id === activeConversation.userId)
    : null;

  // Auto-select first conversation
  React.useEffect(() => {
    if (!selectedUserId && filteredConversations.length > 0) {
      setSelectedUserId(filteredConversations[0].userId);
    }
  }, [filteredConversations, selectedUserId]);

  const unreadCount = (userId: string) =>
    messages.filter((m) => m.fromId === userId && m.toId === currentUserId && !m.read).length;

  // Handlers
  const handleSend = () => {
    if (!activeConversation || !composerText.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      fromId: currentUserId,
      toId: activeConversation.userId,
      body: composerText.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setComposerText('');
    showToast('success', 'Message sent', `Sent to ${otherUser?.firstName ?? ''} ${otherUser?.lastName ?? ''}`);

    // Simulate reply after 1.5s
    setTimeout(() => {
      const autoReply: Message = {
        id: `msg-${Date.now()}-r`,
        fromId: activeConversation.userId,
        toId: currentUserId,
        body: 'Thanks, noted!',
        createdAt: new Date().toISOString(),
        read: false,
      };
      setMessages((prev) => [...prev, autoReply]);
    }, 1500);
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedUserId(userId);
    // Mark incoming messages as read
    setMessages((prev) =>
      prev.map((m) =>
        m.fromId === userId && m.toId === currentUserId ? { ...m, read: true } : m
      )
    );
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (u: typeof mockUsers[number]) =>
    `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Messages</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Conversations with other members of the portal
        </p>
      </div>

      {/* 2-column layout */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 240px)', minHeight: '520px' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-full sm:w-[320px] flex-shrink-0 border-r border-slate-200 flex flex-col bg-slate-50/50">
            {/* Search */}
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No conversations</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filteredConversations.map((conv) => {
                    const u = mockUsers.find((x) => x.id === conv.userId);
                    if (!u) return null;
                    const lastMsg = conv.messages[conv.messages.length - 1];
                    const unread = unreadCount(conv.userId);
                    const isActive = activeConversation?.userId === conv.userId;

                    return (
                      <li key={conv.userId}>
                        <button
                          onClick={() => handleSelectConversation(conv.userId)}
                          className={`w-full text-left p-4 transition-colors flex items-center gap-3 ${
                            isActive ? 'bg-cyan-50 border-l-4 border-cyan' : 'hover:bg-white'
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(u)}
                            </div>
                            {unread > 0 && (
                              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
                                {unread}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {u.firstName} {u.lastName}
                              </p>
                              <span className="text-[10px] text-slate-400 flex-shrink-0">
                                {formatDate(lastMsg.createdAt)}
                              </span>
                            </div>
                            <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                              {lastMsg.fromId === currentUserId ? 'You: ' : ''}
                              {lastMsg.body}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Conversation pane */}
          <div className="flex-1 flex flex-col bg-white">
            {!activeConversation || !otherUser ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-base font-semibold text-slate-700">No conversation selected</p>
                  <p className="text-sm text-slate-500 mt-1">Pick a conversation from the left</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3 bg-white">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(otherUser)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {otherUser.firstName} {otherUser.lastName}
                    </p>
                    <p className="text-xs text-slate-500 capitalize flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      {otherUser.role}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
                  {activeConversation.messages.map((m) => {
                    const isMine = m.fromId === currentUserId;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMine
                                ? 'bg-gradient-to-br from-navy to-navy-dark text-white rounded-br-sm'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                            }`}
                          >
                            {m.body}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {formatTime(m.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Composer */}
                <div className="p-4 border-t border-slate-200 bg-white">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={2}
                      className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan resize-none transition-all"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!composerText.trim()}
                      className="p-3.5 bg-gradient-to-r from-navy to-navy-dark text-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex-shrink-0"
                      aria-label="Send"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono">Shift+Enter</kbd> for new line
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Users className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Demo note:</strong> This is a local message inbox.
            Messages persist in memory and auto-reply after 1.5 seconds when you send. Try
            switching between accounts to see different conversations.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Messages;