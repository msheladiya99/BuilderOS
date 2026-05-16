import { useState } from "react";
import { useData } from "../../../context/DataContext";
import type { Customer } from "../../../types";
import { Search, Plus, Phone, Mail, MapPin, FileText, ChevronRight, X, CheckCircle2, Clock } from "lucide-react";

type CustomersModuleProps = { isDark: boolean };

export function CustomersModule({ isDark }: CustomersModuleProps) {
  const { customers, persist, saving } = useData();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", unit: "", type: "Buyer" });

  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border}`;

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.unit.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedCustomer) {
    const c = selectedCustomer;
    const PAYMENT_HISTORY = [
      { date: "15 May 2026", amount: "₹4,50,000", type: "EMI", receipt: "RCP-8042", mode: "NEFT", status: "Received" },
      { date: "15 Apr 2026", amount: "₹4,50,000", type: "EMI", receipt: "RCP-7985", mode: "NEFT", status: "Received" },
      { date: "15 Mar 2026", amount: "₹4,50,000", type: "EMI", receipt: "RCP-7920", mode: "NEFT", status: "Received" },
      { date: "20 Jan 2024", amount: "₹10,00,000", type: "Part Payment", receipt: "RCP-6142", mode: "RTGS", status: "Received" },
      { date: "12 Mar 2023", amount: "₹5,00,000", type: "Booking Advance", receipt: "RCP-5210", mode: "Cheque", status: "Received" },
    ];

    return (
      <div className="p-5 space-y-5">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setSelectedCustomer(null)} className={`${muted} hover:text-blue-500`}>Customers</button>
          <ChevronRight size={14} className={muted} />
          <span className={text}>{c.name}</span>
        </div>

        <div className={`${card} rounded-2xl p-5`}>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {c.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className={`font-bold ${text}`}>{c.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.kyc === "Verified" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                  KYC {c.kyc}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "Active" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                  {c.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className={muted} />
                  <span className={`text-sm ${muted}`}>{c.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail size={13} className={muted} />
                  <span className={`text-sm ${muted}`}>{c.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className={muted} />
                  <span className={`text-sm ${muted}`}>{c.city}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className={`px-3 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                <Phone size={14} />
              </button>
              <button className={`px-3 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                <Mail size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
            {[
              { label: "Unit", value: c.unit },
              { label: "Total Paid", value: c.totalPaid },
              { label: "Balance Due", value: c.balance || "Fully Paid" },
            ].map(d => (
              <div key={d.label}>
                <div className={`text-xs ${muted}`}>{d.label}</div>
                <div className={`text-sm font-bold mt-0.5 ${d.label === "Balance Due" && c.balance ? "text-orange-500" : text}`}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className={`${card} rounded-2xl overflow-hidden`}>
          <div className={`flex border-b ${border} overflow-x-auto`}>
            {["profile", "payments", "documents", "kyc", "communication"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3 text-xs font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? "border-blue-600 text-blue-600" : `border-transparent ${muted}`}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="p-5">
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-medium mb-3 ${text}`}>Personal Details</h4>
                  <div className="space-y-2">
                    {[
                      { label: "Full Name", value: c.name },
                      { label: "Email", value: c.email },
                      { label: "Mobile", value: c.phone },
                      { label: "City", value: c.city },
                      { label: "Customer Type", value: c.type },
                      { label: "Registration Date", value: c.joinDate },
                    ].map(d => (
                      <div key={d.label} className={`flex justify-between py-2 border-b ${isDark ? "border-slate-700/50" : "border-slate-100"}`}>
                        <span className={`text-xs ${muted}`}>{d.label}</span>
                        <span className={`text-xs font-medium ${text}`}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium mb-3 ${text}`}>Property Details</h4>
                  <div className={`p-4 rounded-xl ${isDark ? "bg-slate-700/50" : "bg-slate-50"} space-y-2`}>
                    {[
                      { label: "Unit", value: c.unit },
                      { label: "Agreement Value", value: "₹62,50,000" },
                      { label: "Possession Date", value: "Dec 2025" },
                      { label: "Loan Status", value: "HDFC Bank - ₹42L" },
                      { label: "Insurance", value: "SBI Life - Active" },
                    ].map(d => (
                      <div key={d.label} className={`flex justify-between py-1.5`}>
                        <span className={`text-xs ${muted}`}>{d.label}</span>
                        <span className={`text-xs font-medium ${text}`}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${border}`}>
                      {["Date", "Type", "Amount", "Receipt", "Mode", "Status"].map(h => (
                        <th key={h} className={`text-left pb-3 pr-4 text-xs font-semibold ${muted} uppercase`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                    {PAYMENT_HISTORY.map((p, i) => (
                      <tr key={i}>
                        <td className={`py-2.5 pr-4 text-xs ${muted}`}>{p.date}</td>
                        <td className={`py-2.5 pr-4 text-xs ${text}`}>{p.type}</td>
                        <td className="py-2.5 pr-4 text-xs font-semibold text-emerald-600">{p.amount}</td>
                        <td className={`py-2.5 pr-4 text-xs font-mono ${muted}`}>{p.receipt}</td>
                        <td className={`py-2.5 pr-4 text-xs ${muted}`}>{p.mode}</td>
                        <td className="py-2.5">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "kyc" && (
              <div className="space-y-4">
                <h4 className={`font-medium ${text}`}>KYC Documents</h4>
                {[
                  { doc: "Aadhaar Card", status: "Verified", number: "XXXX-XXXX-4521" },
                  { doc: "PAN Card", status: "Verified", number: "ABCDE1234F" },
                  { doc: "Address Proof", status: "Verified", number: "Electricity Bill" },
                  { doc: "Photo ID", status: c.kyc === "Verified" ? "Verified" : "Pending", number: "Passport photo" },
                ].map(d => (
                  <div key={d.doc} className={`flex items-center justify-between p-3 rounded-xl border ${border}`}>
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-blue-500" />
                      <div>
                        <div className={`text-sm font-medium ${text}`}>{d.doc}</div>
                        <div className={`text-xs ${muted}`}>{d.number}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.status === "Verified" ? (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      ) : (
                        <Clock size={14} className="text-orange-500" />
                      )}
                      <span className={`text-xs ${d.status === "Verified" ? "text-emerald-600" : "text-orange-600"}`}>{d.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(activeTab === "documents" || activeTab === "communication") && (
              <div className="text-center py-12">
                <FileText size={32} className="mx-auto text-slate-300 mb-3" />
                <p className={`text-sm ${text}`}>No {activeTab} yet</p>
                <p className={`text-xs ${muted} mt-1`}>Add {activeTab} for this customer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={text}>Customers</h1>
          <p className={`text-sm ${muted}`}>{customers.length} registered customers</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
          <Plus size={15} /> Add Customer
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 ${card}`}>
            <h3 className={`font-semibold ${text}`}>Add Customer</h3>
            {["name", "email", "phone", "city", "unit", "type"].map((k) => (
              <input key={k} placeholder={k} value={form[k as keyof typeof form]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`} />
            ))}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
              <button disabled={saving} onClick={async () => {
                await persist("customers", { ...form, status: "Active", kyc: "Pending", totalPaid: "₹0", balance: "—", joinDate: "Today" }, undefined, `Customer added: ${form.name}`);
                setShowAdd(false);
              }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} w-80`}>
        <Search size={14} className={muted} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, unit..." className={`flex-1 text-sm bg-transparent outline-none ${isDark ? "text-white" : "text-slate-800"}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} onClick={() => setSelectedCustomer(c)} className={`${card} rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all`}>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {c.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 justify-between">
                  <h3 className={`font-semibold text-sm ${text}`}>{c.name}</h3>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{c.status}</span>
                </div>
                <div className={`text-xs ${muted} mt-0.5 flex items-center gap-1`}>
                  <MapPin size={10} /> {c.city}
                </div>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-xl ${isDark ? "bg-slate-700/40" : "bg-slate-50"}`}>
              <div className={`text-xs ${muted}`}>Unit</div>
              <div className={`text-xs font-medium ${text} mt-0.5`}>{c.unit}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <div className={`text-xs ${muted}`}>Total Paid</div>
                <div className="text-xs font-bold text-emerald-600">{c.totalPaid}</div>
              </div>
              <div>
                <div className={`text-xs ${muted}`}>Balance</div>
                <div className={`text-xs font-bold ${c.balance ? "text-orange-500" : muted}`}>{c.balance || "Fully Paid"}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.kyc === "Verified" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>KYC {c.kyc}</span>
              <span className={`text-xs ${muted}`}>Since {c.joinDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
