import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

type Role = "user" | "assistant";

type Message = {
  role: Role;
  content: string;
  streaming?: boolean;
};

type SkillCard = {
  id: string;
  title: string;
  description: string;
  artifact: string;
  trigger: string;
};

const SKILLS: SkillCard[] = [
  {
    id: "S1",
    title: "Разобрать задачу",
    description: "Структурирует хаос, выделяет known/unknown",
    artifact: "Discovery Brief",
    trigger: "Запусти S1.",
  },
  {
    id: "S2",
    title: "Синтез интервью",
    description: "Из транскрипта делает структурированный отчёт",
    artifact: "Synthesis Report",
    trigger: "Запусти S2.",
  },
  {
    id: "S3",
    title: "Анализ конкурентов",
    description: "Сравнительная таблица по продуктовым критериям",
    artifact: "Competitive Analysis",
    trigger: "Запусти S3.",
  },
  {
    id: "S4",
    title: "Сформулировать проблему",
    description: "Problem Statement по строгому шаблону",
    artifact: "Problem Statement",
    trigger: "Запусти S4.",
  },
  {
    id: "S5",
    title: "Найти пробелы",
    description: "Что неизвестно и что блокирует дизайн",
    artifact: "Gap Analysis",
    trigger: "Запусти S5.",
  },
  {
    id: "S6",
    title: "Готова ли к дизайну",
    description: "Чеклист из 8 критериев с вердиктом",
    artifact: "Readiness Check",
    trigger: "Запусти S6.",
  },
];

const API_URL = import.meta.env.VITE_API_URL ?? "";

export function ResearchPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pathExpanded, setPathExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const adjustTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMessage: Message = { role: "user", content: text.trim() };
      const history = messages.map(({ role, content }) => ({ role, content }));

      setMessages((prev) => [
        ...prev,
        userMessage,
        { role: "assistant", content: "", streaming: true },
      ]);
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(`${API_URL}/api/v1/research/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim(), history }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data:")) {
              const data = line.slice(5).trim();
              if (!data) continue;
              try {
                const parsed = JSON.parse(data) as { text: string };
                setMessages((prev) => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last && last.role === "assistant") {
                    next[next.length - 1] = {
                      ...last,
                      content: last.content + parsed.text,
                    };
                  }
                  return next;
                });
              } catch {
                // skip malformed lines
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === "assistant") {
              next[next.length - 1] = {
                ...last,
                content:
                  last.content ||
                  "Произошла ошибка при получении ответа. Проверьте подключение к API.",
              };
            }
            return next;
          });
        }
      } finally {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && last.role === "assistant") {
            next[next.length - 1] = { ...last, streaming: false };
          }
          return next;
        });
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming]
  );

  const handleSkillClick = (trigger: string) => {
    sendMessage(trigger);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "var(--color-background)",
        color: "var(--color-text-primary)",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--color-border)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        <a
          href="/"
          style={{
            color: "var(--color-text-secondary)",
            textDecoration: "none",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          ← Главная
        </a>
        <span style={{ color: "var(--color-border)" }}>|</span>
        <span style={{ fontSize: "14px", fontWeight: 500 }}>
          Discovery Agent
        </span>
      </header>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              gap: "8px",
              paddingBottom: "80px",
            }}
          >
            <p
              style={{
                fontSize: "24px",
                fontWeight: 600,
                margin: 0,
              }}
            >
              Discovery Agent
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "var(--color-text-secondary)",
                margin: 0,
              }}
            >
              Выбери скилл или напиши сообщение
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "100%",
            }}
          >
            <div
              style={{
                maxWidth: msg.role === "user" ? "70%" : "100%",
                backgroundColor:
                  msg.role === "user" ? "var(--color-surface)" : "transparent",
                padding: msg.role === "user" ? "10px 14px" : "0",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              {msg.role === "user" ? (
                <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
              ) : (
                <div className="markdown-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  {msg.streaming && (
                    <span
                      style={{
                        display: "inline-block",
                        width: "2px",
                        height: "14px",
                        backgroundColor: "var(--color-text-secondary)",
                        marginLeft: "2px",
                        verticalAlign: "middle",
                        animation: "blink 1s step-end infinite",
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom panel */}
      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "16px 24px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Recommended path hint */}
        <div>
          <button
            onClick={() => setPathExpanded((v) => !v)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-secondary)",
              fontSize: "12px",
              cursor: "pointer",
              padding: "0",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: pathExpanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.15s",
                fontSize: "10px",
              }}
            >
              ▶
            </span>
            Рекомендуемый путь →
          </button>
          {pathExpanded && (
            <div
              style={{
                marginTop: "6px",
                padding: "10px 12px",
                backgroundColor: "var(--color-surface)",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                lineHeight: "1.8",
              }}
            >
              <div>
                <span style={{ color: "var(--color-text-primary)" }}>
                  Минимальный:
                </span>{" "}
                S1 → S4 → S6{" "}
                <span style={{ opacity: 0.6 }}>(15–30 мин)</span>
              </div>
              <div>
                <span style={{ color: "var(--color-text-primary)" }}>
                  Стандартный:
                </span>{" "}
                S1 → S2 → S4 → S5 → S6
              </div>
              <div>
                <span style={{ color: "var(--color-text-primary)" }}>
                  Полный:
                </span>{" "}
                S1 → S2 → S3 → S4 → S5 → S6
              </div>
            </div>
          )}
        </div>

        {/* Skill cards 2x3 grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
          }}
        >
          {SKILLS.map((skill) => (
            <button
              key={skill.id}
              onClick={() => handleSkillClick(skill.trigger)}
              disabled={isStreaming}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "10px 12px",
                cursor: isStreaming ? "not-allowed" : "pointer",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                opacity: isStreaming ? 0.5 : 1,
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isStreaming) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "var(--color-text-secondary)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--color-border)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    backgroundColor: "#2a2a2a",
                    color: "var(--color-text-secondary)",
                    padding: "1px 5px",
                    borderRadius: "3px",
                    letterSpacing: "0.02em",
                  }}
                >
                  {skill.id}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {skill.title}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "var(--color-text-secondary)",
                  lineHeight: "1.4",
                }}
              >
                {skill.description}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: "#555",
                }}
              >
                Выход: {skill.artifact}
              </p>
            </button>
          ))}
        </div>

        {/* Input area */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "flex-end",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextarea();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Напиши сообщение... (Enter — отправить, Shift+Enter — новая строка)"
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              color: "var(--color-text-primary)",
              fontSize: "14px",
              fontFamily: "var(--font-sans)",
              lineHeight: "1.5",
              outline: "none",
              minHeight: "42px",
              maxHeight: "200px",
              overflowY: "auto",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--color-text-secondary)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isStreaming || !input.trim()}
            style={{
              backgroundColor: isStreaming
                ? "var(--color-border)"
                : "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "0 16px",
              height: "42px",
              cursor:
                isStreaming || !input.trim() ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: 500,
              flexShrink: 0,
              opacity: !input.trim() && !isStreaming ? 0.4 : 1,
              transition: "background 0.15s, opacity 0.15s",
            }}
          >
            {isStreaming ? "..." : "Отправить"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .markdown-body h1,
        .markdown-body h2,
        .markdown-body h3,
        .markdown-body h4 {
          margin-top: 1.2em;
          margin-bottom: 0.4em;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .markdown-body h1 { font-size: 1.3em; }
        .markdown-body h2 { font-size: 1.15em; }
        .markdown-body h3 { font-size: 1.05em; }
        .markdown-body p {
          margin: 0.5em 0;
          color: var(--color-text-primary);
        }
        .markdown-body ul,
        .markdown-body ol {
          padding-left: 1.4em;
          margin: 0.4em 0;
        }
        .markdown-body li {
          margin: 0.2em 0;
          color: var(--color-text-primary);
        }
        .markdown-body code {
          background: var(--color-surface);
          padding: 1px 5px;
          border-radius: 3px;
          font-size: 0.88em;
          font-family: ui-monospace, monospace;
        }
        .markdown-body pre {
          background: var(--color-surface);
          padding: 12px;
          border-radius: var(--radius-md);
          overflow-x: auto;
          margin: 0.6em 0;
        }
        .markdown-body pre code {
          background: none;
          padding: 0;
        }
        .markdown-body table {
          border-collapse: collapse;
          width: 100%;
          margin: 0.8em 0;
          font-size: 13px;
        }
        .markdown-body th,
        .markdown-body td {
          border: 1px solid var(--color-border);
          padding: 6px 10px;
          text-align: left;
        }
        .markdown-body th {
          background: var(--color-surface);
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .markdown-body td {
          color: var(--color-text-primary);
        }
        .markdown-body blockquote {
          border-left: 3px solid var(--color-border);
          margin: 0.6em 0;
          padding-left: 12px;
          color: var(--color-text-secondary);
        }
        .markdown-body strong {
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .markdown-body em {
          color: var(--color-text-secondary);
        }
        .markdown-body hr {
          border: none;
          border-top: 1px solid var(--color-border);
          margin: 1em 0;
        }
      `}</style>
    </div>
  );
}
