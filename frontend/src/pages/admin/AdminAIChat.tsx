import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Leaf } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const quickQuestions = [
  "Which plants need attention this month?",
  "What should I remind clients about in April?",
  "Summarise care tasks across all gardens",
];

const adminChatResponses: Record<string, string> = {
  "Which plants need attention this month?":
    "Across your gardens, here are the priorities:\n\n🌹 **The Wisteria House**: The climbing rose needs its spring feed, and the wisteria should be checked for frost damage on new buds.\n\n🌿 **The Oak Lodge Garden**: The hawthorn hedge will be in full blossom soon — avoid trimming until after flowering.\n\nOverall, it's a good time to apply mulch and check supports on all climbers.",
  "What should I remind clients about in April?":
    "Here are suggested reminders for April:\n\n💧 Resume regular watering for Japanese Acers and container plants\n🌱 Apply balanced fertiliser to roses and wisteria\n✂️ Light trim lavender to shape (don't cut old wood)\n🌸 Enjoy the hellebore flowers at Oak Lodge!\n\nWould you like me to draft these as individual reminders?",
  "Summarise care tasks across all gardens":
    "**The Wisteria House** (6 plants):\n- Feed wisteria with potash-rich feed\n- Check rose for aphids, tie in new growth\n- Shape lavender lightly\n- Mulch box hedge, watch for caterpillars\n- Protect acer from late frost\n- Thin foxglove seedlings\n\n**The Oak Lodge Garden** (3 plants):\n- Silver birch: no action needed\n- Hellebores: remove old foliage to show flowers\n- Hawthorn: leave until after blossom",
};

export default function AdminAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const response =
      adminChatResponses[text] ||
      "I'm reviewing care data across all your gardens... Based on the current season and your plant profiles, I'd recommend checking each garden's seasonal care notes. Would you like a specific breakdown for any garden?";

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) sendMessage(input.trim());
  };

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh)] bg-background">
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <div className="w-8 h-8 rounded-full garden-gradient flex items-center justify-center">
          <Leaf size={14} className="text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground">Shagari AI</h2>
          <p className="text-[10px] text-muted-foreground">
            Admin view — All Gardens
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 pb-20">
            <div className="w-16 h-16 rounded-full garden-gradient-soft flex items-center justify-center">
              <Leaf className="text-primary" size={28} />
            </div>
            <div className="text-center">
              <h3 className="font-display font-semibold text-foreground">
                Admin Garden Assistant
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ask about any garden, plant, or care schedule
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left px-4 py-3 rounded-xl bg-card garden-shadow text-sm text-foreground hover:bg-secondary transition-colors active:scale-[0.98]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-7 h-7 rounded-full garden-gradient flex items-center justify-center mr-2 mt-1 shrink-0">
                  <Leaf size={12} className="text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.sender === "user"
                    ? "bg-[hsl(105,37%,21%)] text-white rounded-br-md"
                    : "bg-card garden-shadow text-foreground rounded-bl-md"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-full garden-gradient flex items-center justify-center shrink-0">
              <Leaf size={12} className="text-primary-foreground" />
            </div>
            <div className="bg-card garden-shadow px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 bg-card border-t border-border"
      >
        <div className="flex gap-2 max-w-2xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your gardens..."
            className="flex-1 px-4 py-3 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-11 h-11 rounded-xl garden-gradient flex items-center justify-center text-primary-foreground disabled:opacity-40 transition-opacity active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
