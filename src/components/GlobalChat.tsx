"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Send, MessageSquare, X, ChevronRight, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  user_id: string;
  user_email: string;
  message: string;
  created_at: string;
  vip_level?: string;
}

export default function GlobalChat() {
  const { session, balance } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine VIP level mock based on balance for UI purposes
  const getVipLevel = (bal: number) => {
    if (bal > 10000) return { name: "DIAMOND", color: "text-blue-400" };
    if (bal > 5000) return { name: "GOLD", color: "text-yellow-400" };
    if (bal > 1000) return { name: "SILVER", color: "text-gray-400" };
    return { name: "BRONZE", color: "text-orange-700" };
  };

  const currentVip = getVipLevel(balance);

  useEffect(() => {
    // Initial fetch
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (!error && data) {
        setMessages(data.reverse());
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel("public:chat_messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Sohbete katılmak için giriş yapın.");
      return;
    }
    if (!newMessage.trim()) return;

    const msg = newMessage.trim();
    setNewMessage("");

    const { error } = await supabase.from("chat_messages").insert([
      {
        user_id: session.user.id,
        user_email: session.user.email?.split("@")[0] || "Anon",
        message: msg,
        vip_level: currentVip.name,
      }
    ]);

    if (error) {
      toast.error("Mesaj gönderilemedi: " + error.message);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#16a34a] hover:bg-[#15803d] text-white p-4 rounded-full shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-transform hover:scale-110"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full sm:w-[350px] h-full bg-[#0b0e11] border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#14151a]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#16a34a]" />
                <h2 className="text-white font-black tracking-widest text-sm uppercase">Global Chat</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm mt-10">
                  Henüz mesaj yok. İlk mesajı sen gönder!
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={msg.id || idx} className="text-sm">
                    <div className="flex items-baseline gap-2 mb-1">
                      {msg.vip_level && (
                        <span className={`text-[9px] font-black tracking-wider border px-1 rounded flex items-center gap-0.5 ${
                          msg.vip_level === 'DIAMOND' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' :
                          msg.vip_level === 'GOLD' ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' :
                          msg.vip_level === 'SILVER' ? 'text-gray-300 border-gray-400/30 bg-gray-400/10' :
                          'text-orange-500 border-orange-500/30 bg-orange-500/10'
                        }`}>
                          <Crown className="w-2.5 h-2.5" /> {msg.vip_level}
                        </span>
                      )}
                      <span className="font-bold text-gray-300">{msg.user_email}</span>
                      <span className="text-[10px] text-gray-600">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-gray-100 break-words leading-relaxed pl-1">
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-[#14151a]">
              {session ? (
                <form onSubmit={sendMessage} className="relative">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Sohbete katıl..."
                    className="w-full bg-[#0b0e11] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-[#16a34a] transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#16a34a] text-white rounded-lg hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="text-center p-3 border border-dashed border-white/20 rounded-xl bg-white/5">
                  <p className="text-sm text-gray-400 font-bold mb-2">Sohbete katılmak için giriş yapmalısın.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
