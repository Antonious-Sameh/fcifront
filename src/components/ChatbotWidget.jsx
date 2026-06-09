import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import {
  Bot, X, Send, Minimize2, Maximize2,
  Sparkles, RotateCcw, User, Loader2, WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ✅ بنبعت للباك إند بتاعنا — مش Gemini/Anthropic مباشرة
const API_URL = import.meta.env.VITE_API_URL || '/api';
const getToken = () => localStorage.getItem('fci_token');

// ── Suggested questions ───────────────────────────────────────────
const SUGGESTIONS = {
  ar: [
    'إيه أفضل مسار لتطوير الويب؟',
    'إيه الفرق بين CS وIS؟',
    'كيف أبدأ تعلم البرمجة؟',
    'إيه المواد المهمة في السنة الأولى؟',
    'إيه مجالات الـ AI؟',
  ],
  en: [
    'What is the best web development track?',
    'What is the difference between CS and IS?',
    'How do I start learning programming?',
    'What are the most important first year subjects?',
    'What are AI fields?',
  ],
};

// ── Message bubble ────────────────────────────────────────────────
const MessageBubble = ({ msg, isAr }) => {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex items-end gap-2 mb-3', isUser ? (isAr ? 'flex-row' : 'flex-row-reverse') : (isAr ? 'flex-row-reverse' : 'flex-row'))}
    >
      {/* Avatar */}
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border'
      )}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
      </div>

      {/* Bubble */}
      <div className={cn(
        'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
        isUser
          ? 'bg-primary text-primary-foreground rounded-br-sm'
          : 'bg-muted border border-border text-foreground rounded-bl-sm',
        isAr && 'text-right'
      )}>
        {msg.content.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < msg.content.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
        <div className={cn('text-[10px] mt-1 opacity-60', isUser ? 'text-primary-foreground' : 'text-muted-foreground', isAr ? 'text-right' : 'text-left')}>
          {new Date(msg.ts).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
};

// ── Typing indicator ──────────────────────────────────────────────
const TypingIndicator = ({ isAr }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className={cn('flex items-end gap-2 mb-3', isAr && 'flex-row-reverse')}
  >
    <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
      <Bot className="w-3.5 h-3.5 text-primary" />
    </div>
    <div className="bg-muted border border-border rounded-2xl rounded-bl-sm px-4 py-3">
      <div className="flex gap-1 items-center">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-primary/60 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// ── Main Widget ───────────────────────────────────────────────────
const ChatbotWidget = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  // Greeting on first open
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      const greeting = isAr
        ? `أهلاً ${user?.name?.split(' ')[0] || 'طالب'} 👋\nأنا مساعدك الذكي في منصة الكلية!\n\nيمكنني مساعدتك في:\n• المواد والمحاضرات\n• اختيار المسار المهني\n• معلومات الأقسام\n• نصائح الدراسة والتعلم\n\nاسألني أي حاجة!`
        : `Hello ${user?.name?.split(' ')[0] || 'Student'} 👋\nI'm your AI assistant on FCI Platform!\n\nI can help you with:\n• Subjects and lectures\n• Choosing a career track\n• Department information\n• Study and learning tips\n\nAsk me anything!`;

      setMessages([{ role: 'assistant', content: greeting, ts: Date.now() }]);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted, isAr, user?.name]);

  // Focus input when open
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

 

  const sendMessage = useCallback(async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    const userMsg = { role: 'user', content: userText, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg]
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));

      // ✅ بنبعت للباك إند بتاعنا — مش Gemini مباشرة
      const token = getToken();
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: history, language }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message || (isAr ? '⚠️ حدث خطأ، حاول مرة أخرى.' : '⚠️ Error occurred, please try again.'),
          ts: Date.now(),
          isError: true,
        }]);
        return;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        ts: Date.now(),
      }]);

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: isAr
          ? '⚠️ تعذر الاتصال بالسيرفر. تأكد إن الباك إند شغال على port 5000.'
          : '⚠️ Cannot connect to server. Make sure backend is running on port 5000.',
        ts: Date.now(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, messages, language, isAr]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setHasGreeted(false);
  };

  const suggestions = SUGGESTIONS[language] || SUGGESTIONS.ar;
  const showSuggestions = messages.length <= 1;

  return (
    <>
      {/* ── FAB Button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              'fixed bottom-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-xl',
              'flex items-center justify-center hover:bg-primary/90 transition-colors',
              isAr ? 'left-6' : 'right-6'
            )}
          >
            <Bot className="w-6 h-6" />
            {/* Pulse */}
            <span className="absolute inset-0 rounded-2xl bg-primary animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'fixed z-50 flex flex-col bg-background border border-border shadow-2xl rounded-2xl overflow-hidden',
              isMaximized
                ? 'inset-4 md:inset-8'
                : cn(
                  'w-[360px] h-[520px]',
                  isAr ? 'bottom-6 left-6' : 'bottom-6 right-6'
                )
            )}
          >
            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shrink-0">
              <div className="w-8 h-8 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className={cn('flex-1 min-w-0', isAr && 'text-right')}>
                <p className="font-bold text-sm">{isAr ? 'المساعد الذكي' : 'AI Assistant'}</p>
                <div className={cn('flex items-center gap-1.5', isAr && 'flex-row-reverse justify-end')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-primary-foreground/70">{isAr ? 'متاح الآن' : 'Online'}</span>
                </div>
              </div>
              <div className={cn('flex items-center gap-1', isAr && 'flex-row-reverse')}>
                <button onClick={clearChat} className="p-1.5 hover:bg-primary-foreground/20 rounded-lg transition-colors" title={isAr ? 'محادثة جديدة' : 'New chat'}>
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsMaximized(p => !p)} className="p-1.5 hover:bg-primary-foreground/20 rounded-lg transition-colors">
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-primary-foreground/20 rounded-lg transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0 min-h-0">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} isAr={isAr} />
              ))}

              <AnimatePresence>
                {loading && <TypingIndicator isAr={isAr} />}
              </AnimatePresence>

              {/* Suggestions */}
              {showSuggestions && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2 mt-3"
                >
                  <p className={cn('text-xs text-muted-foreground px-1', isAr && 'text-right')}>
                    {isAr ? '💡 اقتراحات:' : '💡 Suggestions:'}
                  </p>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className={cn(
                        'w-full text-start text-xs px-3 py-2 rounded-xl border border-border bg-muted/30',
                        'hover:bg-muted hover:border-primary/30 transition-all',
                        isAr && 'text-right'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input ── */}
            <div className="px-3 py-3 border-t border-border bg-muted/20 shrink-0">
              <div className={cn('flex items-end gap-2', isAr && 'flex-row-reverse')}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isAr ? 'اكتب سؤالك...' : 'Type your question...'}
                  rows={1}
                  dir={isAr ? 'rtl' : 'ltr'}
                  className={cn(
                    'flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    'placeholder:text-muted-foreground max-h-24 min-h-[40px]',
                    isAr && 'text-right'
                  )}
                  style={{ height: 'auto' }}
                  onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'; }}
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
                    input.trim() && !loading
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className={cn('w-4 h-4', isAr && 'rotate-180')} />
                  }
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
                {isAr ? 'مدعوم بـ Gemini AI · Enter للإرسال' : 'Powered by Gemini AI · Enter to send'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;