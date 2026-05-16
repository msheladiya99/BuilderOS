import { useState } from "react";
import { HelpCircle, Mail, Phone, MessageSquare, ChevronDown, ChevronUp, Loader2, Check } from "lucide-react";
import { api } from "../../../lib/api";

type HelpSupportPageProps = { isDark: boolean };

const FAQ = [
  {
    q: "How do I add a new project?",
    a: "Go to Projects → All Projects and click Create Project. Fill in RERA, location, and unit details.",
  },
  {
    q: "How do I record a customer payment?",
    a: "Open Payments → New Receipt, select the customer and unit, then enter amount and mode.",
  },
  {
    q: "How do I upload construction photos?",
    a: "Navigate to Construction Tracker → Photos tab. Use Choose Files or drag and drop images.",
  },
  {
    q: "Can I export accounting reports?",
    a: "Yes. Go to Accounting → P&L or GST Summary and use the export options at the top right.",
  },
];

export function HelpSupportPage({ isDark }: HelpSupportPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      await api.addActivity(`Support ticket: ${subject.trim()}`, "blue");
      setSent(true);
      setSubject("");
      setMessage("");
      setTimeout(() => setSent(false), 4000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-5 space-y-5 max-w-3xl">
      <div>
        <h1 className={`text-xl font-bold flex items-center gap-2 ${text}`}>
          <HelpCircle size={22} /> Help & Support
        </h1>
        <p className={`text-sm ${muted}`}>FAQs, contact options, and support requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: Mail, label: "Email", value: "support@builderos.in", href: "mailto:support@builderos.in" },
          { icon: Phone, label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
          { icon: MessageSquare, label: "WhatsApp", value: "Chat with us", href: "https://wa.me/919876543210" },
        ].map(({ icon: Icon, label, value, href }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={`${card} p-4 hover:border-blue-400 transition-colors block`}
          >
            <Icon size={18} className="text-blue-500 mb-2" />
            <div className={`text-xs ${muted}`}>{label}</div>
            <div className={`text-sm font-medium ${text}`}>{value}</div>
          </a>
        ))}
      </div>

      <div className={`${card} p-5`}>
        <h2 className={`font-semibold mb-3 ${text}`}>Frequently asked questions</h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className={`border rounded-xl overflow-hidden ${border}`}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium ${text} hover:bg-slate-50 dark:hover:bg-slate-700/50`}
              >
                {item.q}
                {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openFaq === i && (
                <p className={`px-4 pb-3 text-sm ${muted}`}>{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`${card} p-5 space-y-4`}>
        <h2 className={`font-semibold ${text}`}>Submit a support request</h2>
        <label className="block">
          <span className={`text-xs font-medium ${muted}`}>Subject</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="Brief summary of your issue"
            className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm ${border} ${isDark ? "bg-slate-900" : "bg-white"}`}
          />
        </label>
        <label className="block">
          <span className={`text-xs font-medium ${muted}`}>Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            placeholder="Describe your issue in detail…"
            className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm resize-none ${border} ${isDark ? "bg-slate-900" : "bg-white"}`}
          />
        </label>
        {sent && (
          <p className="text-sm text-emerald-600 flex items-center gap-1">
            <Check size={14} /> Request submitted. Our team will respond within 24 hours.
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : null}
          Send request
        </button>
      </form>
    </div>
  );
}
