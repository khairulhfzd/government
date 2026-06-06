import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Shield, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: 'Halo! Saya Asisten Digital Kota Digital. Ada yang bisa saya bantu hari ini? Anda bisa bertanya mengenai syarat pembuatan KTP, KK, Domisili, atau cara membuat laporan pengaduan.',
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState('main');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessageToServer = async (userMsg) => {
    // Add user message to state
    const userMsgObj = {
      id: Date.now().toString(),
      role: 'user',
      text: userMsg,
      time: new Date()
    };
    
    setMessages((prev) => [...prev, userMsgObj]);
    setIsLoading(true);

    try {
      // Map history for Gemini backend route and filter out the welcome message
      const chatHistory = messages
        .filter(msg => msg.id !== 'welcome')
        .map(msg => ({
          role: msg.role,
          text: msg.text
        }));

      const response = await api.post('/chat', {
        message: userMsg,
        history: chatHistory
      });

      const botReplyObj = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.data.reply,
        time: new Date()
      };

      setMessages((prev) => [...prev, botReplyObj]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMsgObj = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Maaf, sepertinya ada kendala koneksi ke server. Silakan coba kembali beberapa saat lagi.',
        time: new Date()
      };
      setMessages((prev) => [...prev, errorMsgObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    sendMessageToServer(userMsg);
  };

  const handleQuickQuestion = (question) => {
    if (isLoading) return;
    sendMessageToServer(question);
  };

  const formatMessageText = (text) => {
    if (!text) return '';
    
    return text.split('\n').map((line, index) => {
      let cleanLine = line.trim();
      
      const isBullet = cleanLine.startsWith('*') || cleanLine.startsWith('-');
      const isNumbered = /^\d+\./.test(cleanLine);
      
      if (isBullet) {
        cleanLine = cleanLine.replace(/^[\*\-]\s*/, '');
      }
      
      const parts = [];
      let currentText = cleanLine;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      let lastIndex = 0;
      
      while ((match = boldRegex.exec(currentText)) !== null) {
        if (match.index > lastIndex) {
          parts.push(currentText.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-blue-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < currentText.length) {
        parts.push(currentText.substring(lastIndex));
      }
      
      if (isBullet) {
        return (
          <li key={index} className="list-disc ml-5 mt-1 text-slate-700">
            {parts.length > 0 ? parts : cleanLine}
          </li>
        );
      } else if (isNumbered) {
        const numMatch = cleanLine.match(/^(\d+\.)\s*(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const rest = numMatch[2];
          
          const restParts = [];
          let restText = rest;
          let rMatch;
          let rLastIndex = 0;
          const rBoldRegex = /\*\*(.*?)\*\*/g;
          while ((rMatch = rBoldRegex.exec(restText)) !== null) {
            if (rMatch.index > rLastIndex) {
              restParts.push(restText.substring(rLastIndex, rMatch.index));
            }
            restParts.push(<strong key={rMatch.index} className="font-extrabold text-blue-900">{rMatch[1]}</strong>);
            rLastIndex = rBoldRegex.lastIndex;
          }
          if (rLastIndex < restText.length) {
            restParts.push(restText.substring(rLastIndex));
          }
          
          return (
            <div key={index} className="flex gap-1.5 mt-1.5 text-slate-700">
              <span className="font-bold text-blue-600">{num}</span>
              <span className="flex-1">{restParts.length > 0 ? restParts : rest}</span>
            </div>
          );
        }
      }
      
      if (cleanLine === '') {
        return <div key={index} className="h-2" />;
      }
      
      return (
        <p key={index} className="mt-1 text-slate-700">
          {parts.length > 0 ? parts : cleanLine}
        </p>
      );
    });
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'Halo! Saya Asisten Digital Kota Digital. Ada yang bisa saya bantu hari ini? Anda bisa bertanya mengenai syarat pembuatan KTP, KK, Domisili, atau cara membuat laporan pengaduan.',
        time: new Date()
      }
    ]);
    setActiveTopic('main');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      
      {/* ── CHATBOX WINDOW ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="w-[360px] sm:w-[400px] h-[520px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 flex flex-col mb-4 overflow-hidden"
          >
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-sky-400 p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 relative">
                  <Shield className="w-5.5 h-5.5 text-white" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                    Asisten Layanan Digital
                  </h3>
                  <p className="text-[10px] text-blue-100 font-medium">Online • Siap membantu warga</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={resetChat}
                  title="Mulai Ulang Obrolan"
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer text-blue-50"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer text-blue-50"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    {msg.role !== 'user' && (
                      <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-200/50">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      </div>
                    )}

                    <div className="flex flex-col">
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                        }`}
                      >
                        {msg.role === 'user' ? msg.text : formatMessageText(msg.text)}
                      </div>
                      <span className={`text-[9px] text-slate-400 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Animasi Titik Berkedip */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2.5 max-w-[85%]">
                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Persistent Quick Actions Menu */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto">
              {activeTopic === 'main' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTopic('pengaduan')}
                    disabled={isLoading}
                    className="text-[11px] font-semibold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 px-3 py-1.5 rounded-full border border-blue-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📝 Lapor Pengaduan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTopic('status')}
                    disabled={isLoading}
                    className="text-[11px] font-semibold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 px-3 py-1.5 rounded-full border border-blue-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🔍 Cek Status Laporan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTopic('dokumen')}
                    disabled={isLoading}
                    className="text-[11px] font-semibold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 px-3 py-1.5 rounded-full border border-blue-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📄 Syarat Dokumen
                  </button>
                </>
              ) : (
                <>
                  {activeTopic === 'pengaduan' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickQuestion('Bagaimana cara membuat laporan pengaduan baru di website ini?')}
                        disabled={isLoading}
                        className="text-[10px] text-left font-medium text-slate-700 hover:text-white bg-white hover:bg-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer disabled:opacity-50 w-full"
                      >
                        1️⃣ Cara buat pengaduan baru?
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickQuestion('Apa saja berkas pendukung yang harus diunggah saat membuat pengaduan?')}
                        disabled={isLoading}
                        className="text-[10px] text-left font-medium text-slate-700 hover:text-white bg-white hover:bg-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer disabled:opacity-50 w-full"
                      >
                        2️⃣ Berkas yang harus diunggah?
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickQuestion('Apakah pengaduan saya bersifat rahasia dan identitas saya aman?')}
                        disabled={isLoading}
                        className="text-[10px] text-left font-medium text-slate-700 hover:text-white bg-white hover:bg-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer disabled:opacity-50 w-full"
                      >
                        3️⃣ Apakah pengaduan ini rahasia?
                      </button>
                    </>
                  )}

                  {activeTopic === 'status' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickQuestion('Bagaimana cara mengecek status dan riwayat pengaduan yang pernah saya laporkan?')}
                        disabled={isLoading}
                        className="text-[10px] text-left font-medium text-slate-700 hover:text-white bg-white hover:bg-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer disabled:opacity-50 w-full"
                      >
                        1️⃣ Cara cek status laporan?
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickQuestion('Apa perbedaan arti status laporan Menunggu, Diproses, dan Selesai?')}
                        disabled={isLoading}
                        className="text-[10px] text-left font-medium text-slate-700 hover:text-white bg-white hover:bg-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer disabled:opacity-50 w-full"
                      >
                        2️⃣ Arti status Menunggu/Proses/Selesai?
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickQuestion('Berapa lama waktu yang dibutuhkan dinas terkait untuk memproses laporan saya?')}
                        disabled={isLoading}
                        className="text-[10px] text-left font-medium text-slate-700 hover:text-white bg-white hover:bg-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer disabled:opacity-50 w-full"
                      >
                        3️⃣ Berapa lama laporan diselesaikan?
                      </button>
                    </>
                  )}

                  {activeTopic === 'dokumen' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickQuestion('Apa saja syarat untuk membuat atau mengurus KTP baru?')}
                        disabled={isLoading}
                        className="text-[10px] text-left font-medium text-slate-700 hover:text-white bg-white hover:bg-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer disabled:opacity-50 w-full"
                      >
                        1️⃣ Syarat membuat KTP Baru?
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickQuestion('Bagaimana persyaratan dan cara mengurus Kartu Keluarga (KK) baru?')}
                        disabled={isLoading}
                        className="text-[10px] text-left font-medium text-slate-700 hover:text-white bg-white hover:bg-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer disabled:opacity-50 w-full"
                      >
                        2️⃣ Syarat membuat Kartu Keluarga (KK)?
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickQuestion('Apa saja syarat membuat Surat Keterangan Domisili?')}
                        disabled={isLoading}
                        className="text-[10px] text-left font-medium text-slate-700 hover:text-white bg-white hover:bg-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer disabled:opacity-50 w-full"
                      >
                        3️⃣ Syarat membuat Surat Domisili?
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTopic('main')}
                    disabled={isLoading}
                    className="text-[10px] font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 px-3 py-1.5 rounded-full border border-red-100 transition-all cursor-pointer disabled:opacity-50 ml-auto mt-1"
                  >
                    ↩️ Kembali ke Menu Utama
                  </button>
                </>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan sesuatu..."
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING TOGGLE BUTTON ── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all cursor-pointer relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

    </div>
  );
}
