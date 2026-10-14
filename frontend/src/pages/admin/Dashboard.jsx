import { useEffect, useMemo, useState } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { peso } from "../../utils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const metrics = [
  { key: "totalSales", label: "Total Sales (Delivered)", icon: "fa-truck-ramp-box", color: "electric" },
  { key: "totalOrders", label: "Total Orders", icon: "fa-bag-shopping", color: "indigo" },
  { key: "totalUsers", label: "Total Users", icon: "fa-users", color: "sky" },
  { key: "totalProducts", label: "Total Products", icon: "fa-cubes", color: "amber" },
];

const iconWrap = {
  electric: "bg-electric-50 text-electric-600",
  indigo: "bg-indigo-50 text-indigo-600",
  sky: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
};

export default function Dashboard() {
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [dash, setDash] = useState(null);
  const [tab, setTab] = useState("product");

  useEffect(() => {
    api.get("/admin/dashboard", { params: { from, to } }).then(({ data }) => setDash(data));
  }, [from, to]);

  const chartData = useMemo(() => {
    const labels = dash?.chart?.labels || [];
    const data = dash?.chart?.data || [];
    return {
      labels,
      datasets: [
        {
          label: "Sales (₱)",
          data,
          borderColor: "#2563EB",
          borderWidth: 3,
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 320);
            g.addColorStop(0, "rgba(59, 130, 246, 0.30)");
            g.addColorStop(1, "rgba(59, 130, 246, 0.0)");
            return g;
          },
          fill: true,
          tension: 0.38,
          pointBackgroundColor: "#2563EB",
          pointBorderColor: "#FFFFFF",
          pointBorderWidth: 2,
          pointRadius: 5,
        },
      ],
    };
  }, [dash]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0F172A",
        titleFont: { family: "Inter", size: 13, weight: "bold" },
        bodyFont: { family: "Inter", size: 12 },
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (context) => "Revenue: ₱" + Number(context.parsed.y).toLocaleString(),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "Inter", size: 11, weight: "600" }, color: "#64748B" },
      },
      y: {
        grid: { color: "#F1F5F9" },
        ticks: {
          font: { family: "Inter", size: 11, weight: "600" },
          color: "#64748B",
          callback: (value) =>
            "₱" + (value >= 1000000 ? (value / 1000000).toFixed(1) + "M" : value / 1000 + "K"),
        },
      },
    },
  };

  const items = dash?.breakdowns?.[tab] || [];

  return (
    <>
      <header className="flex items-center justify-between pb-3 mb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
            Welcome back, {user?.name || "Admin"} 👋
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Here's what's happening with your store.
          </p>
        </div>
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-electric-600 text-white font-bold flex items-center justify-center ring-2 ring-electric-500/30">
            {(user?.name || "A")[0]}
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-6">
        {metrics.map((m) => (
          <div
            key={m.key}
            className="bg-white p-5 rounded-2xl border border-slate-200/70 card-shadow hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {m.label}
              </span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconWrap[m.color]}`}>
                <i className={`fa-solid ${m.icon} text-lg`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy-900 tracking-tight">
              {m.key === "totalSales"
                ? peso(dash?.stats?.totalSales || 0)
                : (dash?.stats?.[m.key] ?? "—")}
            </h3>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/70 card-shadow flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xl font-extrabold text-navy-900 tracking-tight">Sales Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Historical revenue performance over time
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  From:
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  To:
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div className="relative flex-1 min-h-[300px] w-full pt-2">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/70 card-shadow">
          <h3 className="text-xl font-extrabold text-navy-900 tracking-tight mb-3">Top Breakdowns</h3>
          <div className="flex bg-slate-100 p-1 rounded-xl mb-3 border border-slate-200/60">
            {["product", "category", "user"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1 text-xs font-extrabold rounded-lg capitalize ${
                  tab === t ? "text-slate-900 bg-white shadow-sm" : "text-slate-500"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="space-y-2.5">
            {items.map((item) => (
              <div key={item.name} className="py-1 space-y-1">
                <div className="flex justify-between items-baseline text-sm leading-tight">
                  <span className="font-extrabold text-slate-900 tracking-tight truncate max-w-[160px]">
                    {item.name}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-500 font-bold text-xs font-mono">{peso(item.amount)}</span>
                    <span className="font-black text-navy-900 text-sm tracking-tight w-11 text-right">
                      {item.percent}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-electric-600 rounded-full" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
            {!items.length && <p className="text-sm text-slate-400">No delivered sales in this range.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
