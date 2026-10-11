import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { sendBotPrompt, getBotHistory } from "../../api/aiApi";
import Button from "../../components/common/Button";
import { Bot, Send, ArrowLeft, User, Sparkles } from "lucide-react";

const AiReportBot = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await getBotHistory(id);
      if (res.success && Array.isArray(res.data)) {
        const formatted = [];
        res.data.forEach((m) => {
          formatted.push({ sender: "user", text: m.userPrompt });
          formatted.push({ sender: "bot", text: m.aiResponse });
        });
        setMessages(formatted);
      }
      setLoading(false);
    };
    fetchHistory();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setSending(true);

    try {
      const res = await sendBotPrompt(id, { prompt: userText });
      if (res.success && res.data) {
        setMessages((prev) => [...prev, { sender: "bot", text: res.data.aiResponse }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I could not process your query right now. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            to={`/citizen/issue/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Issue #{id}
          </Link>
        </div>

        {/* Chat Window Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[650px]">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center gap-3 border-b border-slate-800">
            <div className="p-2 bg-teal-500/20 rounded-xl text-teal-300">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                CivicSense AI Assistant
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                  Online
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">Ask questions regarding ticket #{id} resolution & repair guides</p>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
            {messages.length === 0 && !loading && (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <Sparkles size={28} className="mx-auto text-teal-500 opacity-60" />
                <p>No messages yet. Ask me anything about this civic issue!</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-teal-600 text-white rounded-br-none shadow-md shadow-teal-600/10"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <Bot size={14} className="animate-spin text-teal-500" />
                AI is generating response...
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question regarding repair guidelines..."
              className="flex-1 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <Button type="submit" variant="primary" size="sm" isLoading={sending}>
              <Send size={14} />
            </Button>
          </form>

        </div>

      </div>
    </div>
  );
};

export default AiReportBot;