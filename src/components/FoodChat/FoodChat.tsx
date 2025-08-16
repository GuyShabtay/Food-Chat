import  { useState } from "react";
import "./FoodChat.css";
import InsightsIcon from "@mui/icons-material/Insights";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";

type Message = {
  role: "user" | "assistant";
  text: string;
};

type OpenAIResponse = {
  choices: { message?: { content?: string } }[];
};

export default function FoodChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const handleSend = async (): Promise<void> => {
    if (!input.trim()) return;
    if (showIntro) setShowIntro(false);

    const newMessages: Message[] = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY as string}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "אתה עוזר תזונה. קבל תיאור בעברית של מאכלים (סוג וכמות) והחזר אך ורק את מספר החלבונים ואחריהם הקלוריות. דוגמה: '25 חלבונים, 300 קלוריות'. אל תוסיף טקסט נוסף.",
            },
            ...newMessages.map((m) => ({ role: m.role, content: m.text })),
          ],
          temperature: 0,
        }),
      });

      const data: OpenAIResponse = await res.json();
      const answer = data.choices[0]?.message?.content || "לא הצלחתי לחשב.";

      setMessages([...newMessages, { role: "assistant", text: answer }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: "assistant", text: "שגיאה בחישוב." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div id="header">
        <InsightsIcon id="insight-icon" />
        <h2>Food Chat</h2>
      </div>

      {showIntro && (
        <div className="intro-message">
          <h2>היי גיא, ספר לי מה אכלת ואחשב עבורך קלוריות וחלבונים</h2>
        </div>
      )}
        <InsightsIcon id="insight-icon" />

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="message assistant" style={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress size={20} sx={{ color: "#e0e0e0" }} />
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="כתוב כאן מה אכלת..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button id="send-btn" onClick={handleSend} disabled={loading}>
          <SendIcon id="send-icon" />
        </button>
      </div>
    </div>
  );
}
