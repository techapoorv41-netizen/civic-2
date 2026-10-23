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
    <div className="min-h-screen bg-govLight py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            to={`/citizen/issue/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-govSlate hover:text-govNavy transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Issue #{id}
          </Link>
        </div>

        {/* Chat Window Container */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[650px]">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-govNavy text-white flex items-center gap-3 border-b border-govSlate">
            <div className="p-2 bg-govSlate rounded-xl text-govOrange">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base flex items-center gap-2 text-white">
                CivicSense AI Assistant
                <span className="text-[10px] bg-govOrange text-white px-2 py-0.5 rounded-full font-bold">
                  Online
                </span>
              </h2>
              <p className="text-[11px] text-slate-200">Ask questions regarding ticket #{id} resolution & repair guides</p>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-govLight/40">
            {messages.length === 0 && !loading && (
              <div className="text-center py-12 text-govText text-xs space-y-2">
                <Sparkles size={28} className="mx-auto text-govOrange opacity-80" />
                <p>No messages yet. Ask me anything about this civic issue!</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-xl bg-govOrange text-white flex items-center justify-center shrink-0 shadow-md">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-govNavy text-white rounded-br-none shadow-md shadow-govNavy/20 font-medium"
                      : "bg-white text-govText border border-slate-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-govSlate text-white flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-2 text-xs text-govSlate italic font-medium">
                <Bot size={14} className="animate-spin text-govOrange" />
                AI is generating response...
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question regarding repair guidelines..."
              className="flex-1 rounded-2xl bg-govLight border border-slate-300 px-4 py-2.5 text-xs text-govText focus:outline-none focus:ring-2 focus:ring-govSlate/20 focus:border-govSlate"
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