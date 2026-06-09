import { useMemo, useState } from "react";
import { AlertTriangle, Bot, Loader2, Send, User, X } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import CountryFlag from "@/components/common/CountryFlag";
import { mockCountries } from "@/data/mockCountries";
import { AI_DIMENSIONS, type CountryAIReadiness } from "@/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  countryCodes?: string[];
  error?: boolean;
}

const API_URL = import.meta.env.VITE_CHAT_API_URL ?? "/api/chat";

const EXAMPLE_QUESTIONS = [
  "What is Spain good at?",
  "Compare France and Germany",
  "Show me countries in Africa classified as Developing",
  "What is weak in Brazil?",
  "Tell me about policy and governance in India",
];

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const countries = useMemo(() => {
    return (
      message.countryCodes
        ?.map((code) => mockCountries.find((country) => country.code === code))
        .filter(Boolean) as CountryAIReadiness[]
    ) ?? [];
  }, [message.countryCodes]);

  return (
    <div
      className={`flex gap-3 ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {message.role === "assistant" && (
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
            message.error
              ? "bg-red-100 text-red-700"
              : "bg-slate-950 text-white"
          }`}
        >
          {message.error ? <AlertTriangle size={17} /> : <Bot size={17} />}
        </div>
      )}

      <div
        className={`max-w-3xl rounded-3xl px-5 py-4 text-sm leading-6 shadow-sm ${
          message.role === "user"
            ? "bg-slate-950 text-white"
            : message.error
              ? "border border-red-200 bg-red-50 text-red-800"
              : "border border-slate-200 bg-white text-slate-700"
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>

        {countries.length > 0 && message.role === "assistant" && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
            {countries.map((country) => (
              <div
                key={country.code}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"
              >
                <CountryFlag
                  countryCode={country.code}
                  countryName={country.name}
                  size="sm"
                />
                <span className="text-xs font-bold text-slate-700">
                  {country.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {message.role === "user" && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-slate-700">
          <User size={17} />
        </div>
      )}
    </div>
  );
}

async function parseResponsePayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as { answer?: string; countryCodes?: string[]; error?: string };
  } catch {
    return {
      error: text,
    };
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createId(),
      role: "assistant",
      content:
        "Ask me about countries, enablers, continents, classifications, strengths, weaknesses, or comparisons. I answer using the Excel-generated dataset through the OpenAI API endpoint.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (rawQuestion?: string) => {
    const question = (rawQuestion ?? input).trim();

    if (!question || isLoading) return;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: question,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      const payload = await parseResponsePayload(response);

      if (!response.ok) {
        throw new Error(payload.error ?? "OpenAI request failed.");
      }

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: payload.answer ?? "No answer returned.",
        countryCodes: payload.countryCodes ?? [],
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        error: true,
        content:
          error instanceof Error
            ? error.message
            : "Unknown error while contacting the local chat server.",
      };

      setMessages((currentMessages) => [...currentMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: createId(),
        role: "assistant",
        content:
          "Chat cleared. Ask me about the Excel-generated AI readiness data.",
      },
    ]);
  };

  return (
    <div>
      <PageHeader
        title="Data Chat"
        subtitle="Ask questions about countries, enablers, indicators and classifications using the Excel-generated dataset."
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <section className="flex min-h-[calc(100vh-11rem)] flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-black text-slate-900">
                OpenAI data assistant
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Uses your generated Excel dataset as context. API key stays on
                the server-side API route.
              </p>
            </div>

            <button
              type="button"
              onClick={clearChat}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <X size={13} />
              Clear
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 p-5">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex justify-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Bot size={17} />
                </div>

                <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Thinking with OpenAI...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 p-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                placeholder="Ask about Spain, policy and governance, Africa, classifications, comparisons..."
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                className="min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={isLoading || input.trim().length === 0}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-900">
              Example questions
            </h3>

            <div className="mt-4 space-y-2">
              {EXAMPLE_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-900">
              What this chat can use
            </h3>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                Countries:{" "}
                <span className="font-bold text-slate-900">
                  {mockCountries.length}
                </span>
              </p>
              <p>
                Enablers:{" "}
                <span className="font-bold text-slate-900">
                  {AI_DIMENSIONS.length}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <h3 className="text-sm font-black text-amber-900">
              Important limitation
            </h3>
            <p className="mt-2 text-sm leading-6 text-amber-800">
              The model only sees the dataset context sent by the local server.
              If a country, enabler or indicator is missing from the generated
              profiles, the chat cannot use it.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
