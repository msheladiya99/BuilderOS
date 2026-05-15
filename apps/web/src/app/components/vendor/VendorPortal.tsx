import { useState } from "react";
import { Upload, FileText, CheckCircle2, Clock, X, IndianRupee } from "lucide-react";

type VendorPortalProps = { isDark: boolean };

export function VendorPortal({ isDark }: VendorPortalProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const text = isDark ? "text-white" : "text-slate-800";
  const muted = "text-slate-500";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const card = `bg-white dark:bg-slate-800 border ${border} rounded-2xl`;

  const POS = [
    { id: "PO-4521", items: "Steel TMT Bars 100MT", value: "₹68,00,000", date: "12 May", delivery: "20 May", status: "Confirmed" },
    { id: "PO-4320", items: "Steel TMT Bars 80MT", value: "₹54,40,000", date: "10 Apr", delivery: "18 Apr", status: "Delivered" },
    { id: "PO-4180", items: "Structural Steel 60MT", value: "₹40,80,000", date: "12 Mar", delivery: "20 Mar", status: "Delivered" },
  ];

  const INVOICES = [
    { id: "INV-2024-052", po: "PO-4320", amount: "₹54,40,000", date: "19 Apr", status: "Paid" },
    { id: "INV-2024-038", po: "PO-4180", amount: "₹40,80,000", date: "21 Mar", status: "Paid" },
    { id: "INV-2024-021", po: "PO-4001", amount: "₹36,00,000", date: "14 Feb", status: "Paid" },
  ];

  return (
    <div className="p-5 space-y-5">
      {/* Vendor banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white font-bold text-lg">JS</div>
          <div>
            <div className="text-white font-bold">JSW Steel Ltd</div>
            <div className="text-slate-400 text-sm mt-0.5">Vendor Code: VND-0042 · Category: Steel & Metals</div>
            <div className="text-slate-400 text-xs mt-0.5">GSTIN: 27AAACJ1234A1ZX · Since Jan 2023</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
          {[
            { label: "Total Orders", value: "24" },
            { label: "Total Billed", value: "₹2.4Cr" },
            { label: "Pending Payment", value: "₹68L" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-white font-bold">{s.value}</div>
              <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 w-fit">
        {["dashboard", "purchase-orders", "invoices", "upload-docs"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${activeTab === tab ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500"}`}>
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`${card} p-5`}>
            <h3 className={`font-semibold mb-4 ${text}`}>Open Purchase Orders</h3>
            {POS.filter(p => p.status === "Confirmed").map(po => (
              <div key={po.id} className={`p-4 rounded-xl border ${border} mb-3`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold text-blue-600`}>{po.id}</span>
                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">{po.status}</span>
                </div>
                <div className={`text-xs ${muted}`}>{po.items}</div>
                <div className="flex justify-between mt-2">
                  <span className={`text-sm font-bold ${text}`}>{po.value}</span>
                  <span className={`text-xs ${muted}`}>Deliver by {po.delivery}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={`${card} p-5`}>
            <h3 className={`font-semibold mb-4 ${text}`}>Payment Status</h3>
            <div className="space-y-3">
              {[
                { label: "Amount Received (May)", value: "₹0", status: "pending" },
                { label: "Pending Approval", value: "₹68,00,000", status: "orange" },
                { label: "Total Received (FY)", value: "₹1,72,00,000", status: "green" },
              ].map(s => (
                <div key={s.label} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? "bg-slate-700/40" : "bg-slate-50"}`}>
                  <span className={`text-xs ${muted}`}>{s.label}</span>
                  <span className={`text-sm font-bold ${s.status === "green" ? "text-emerald-600" : s.status === "orange" ? "text-orange-500" : text}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "purchase-orders" && (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  {["PO Number", "Items", "Value", "Order Date", "Delivery Date", "Status"].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {POS.map(po => (
                  <tr key={po.id} className={`hover:${isDark ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-blue-600">{po.id}</td>
                    <td className={`px-4 py-3 text-xs ${text}`}>{po.items}</td>
                    <td className={`px-4 py-3 text-xs font-semibold ${text}`}>{po.value}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{po.date}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{po.delivery}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${po.status === "Delivered" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>{po.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "invoices" && (
        <div className={`${card} overflow-hidden`}>
          <div className={`px-5 py-4 border-b ${border} flex items-center justify-between`}>
            <h3 className={`font-semibold ${text}`}>Invoice History</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs">
              <Upload size={12} /> Submit Invoice
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${border} ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                  {["Invoice No", "Against PO", "Amount", "Date", "Status"].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${muted} uppercase tracking-wide whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-100"}`}>
                {INVOICES.map(inv => (
                  <tr key={inv.id}>
                    <td className={`px-4 py-3 text-xs font-mono ${text}`}>{inv.id}</td>
                    <td className="px-4 py-3 text-xs font-mono text-blue-600">{inv.po}</td>
                    <td className={`px-4 py-3 text-xs font-semibold ${text}`}>{inv.amount}</td>
                    <td className={`px-4 py-3 text-xs ${muted}`}>{inv.date}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "upload-docs" && (
        <div className={`${card} p-5`}>
          <h3 className={`font-semibold mb-4 ${text}`}>Upload Documents</h3>
          <div className={`border-2 border-dashed rounded-xl p-10 text-center mb-4 ${isDark ? "border-slate-700" : "border-slate-300"}`}>
            <Upload size={28} className="mx-auto text-slate-400 mb-2" />
            <p className={`text-sm font-medium ${text}`}>Drop or click to upload</p>
            <p className={`text-xs ${muted} mt-1`}>GST Certificate, PAN, Bank Details, etc.</p>
          </div>
          <div className="space-y-2">
            {["GST Registration Certificate", "PAN Card", "Bank Details (Cancelled Cheque)", "MSME Certificate"].map(doc => (
              <div key={doc} className={`flex items-center justify-between p-3 rounded-xl border ${border}`}>
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-blue-500" />
                  <span className={`text-xs ${text}`}>{doc}</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Uploaded</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
