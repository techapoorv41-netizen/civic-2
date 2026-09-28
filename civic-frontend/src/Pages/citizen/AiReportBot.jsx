import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { sendBotPrompt, getBotHistory } from "..//api/aiApi";

function AiReportBot() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await getBotHistory(id);
      if (res.success) {
        setMessages(res.data);
      }
    };
    fetchHistory();
  }, [id]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    const res = await sendBotPrompt(id, { message: input });
    if (res.success) {
      setMessages((prev) => [...prev, { role: "bot", text: res.data.reply }]);
    }
    setSending(false);
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[80vh] border border-gray-200 rounded-lg bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-lg text-sm max-w-xs ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {sending && <p className="text-xs text-gray-400">AI is typing...</p>}
      </div>

      <div className="border-t border-gray-200 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask something about this issue..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default AiReportBot;