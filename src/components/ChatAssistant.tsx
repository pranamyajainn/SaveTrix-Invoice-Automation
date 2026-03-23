import React from 'react';
import { ChatMessage, InvoiceData } from '../types';
import { Send, Bot, Loader2, MessageSquare, X, Zap } from 'lucide-react';
import { chatWithAssistant } from '../services/geminiService';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  invoiceData?: InvoiceData | null;
}

export const ChatAssistant: React.FC<Props> = ({ invoiceData }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Initial message logic
  React.useEffect(() => {
    if (isOpen && messages.length === 0 && invoiceData) {
      const summary = `I've analyzed your invoice from **${invoiceData.vendorName}** for **${invoiceData.currency} ${invoiceData.totalAmount.toLocaleString()}** dated **${invoiceData.invoiceDate || 'N/A'}**. What would you like to know about it?`;
      
      setMessages([
        { 
          role: 'model', 
          text: summary, 
          timestamp: Date.now() 
        }
      ]);
    }
  }, [isOpen, invoiceData, messages.length]);

  // Reset messages when invoice changes
  React.useEffect(() => {
    setMessages([]);
    setIsOpen(false);
  }, [invoiceData]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAssistant(input, messages, invoiceData || undefined);
      const botMsg: ChatMessage = { role: 'model', text: response, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please try again.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {invoiceData && (
          <motion.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.5 
              } 
            }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 z-50 bg-savetrix-orange text-white px-6 py-4 rounded-full shadow-2xl shadow-savetrix-orange/40 flex items-center gap-3 group"
          >
            <div className="relative">
              <MessageSquare size={24} />
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20 group-hover:opacity-40" />
              {/* Green Ready Dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-savetrix-orange rounded-full shadow-sm" />
            </div>
            <span className="font-bold uppercase tracking-widest text-xs">Ask AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Side Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[380px] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-[60] flex flex-col border-l border-gray-100"
          >
            {/* Drawer Header */}
            <div className="bg-[#1A1A1A] p-6 text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/shapes/svg?seed=savetrix" alt="SaveTrix Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Invoice Assistant</h3>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Powered by Gemini</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[#F9FAFB]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[14px] leading-[1.6] ${
                    msg.role === 'user' 
                      ? 'bg-savetrix-orange text-white rounded-tr-none shadow-lg shadow-savetrix-orange/10' 
                      : 'bg-white text-savetrix-charcoal rounded-tl-none border border-gray-100 shadow-sm'
                  }`}>
                    <div className="prose prose-sm max-w-none">
                      <Markdown>
                        {msg.text}
                      </Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                    <Loader2 size={16} className="animate-spin text-savetrix-orange" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 focus-within:border-savetrix-orange transition-all">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything about this invoice..."
                  className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="bg-savetrix-orange text-white p-3 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-savetrix-orange/20 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
