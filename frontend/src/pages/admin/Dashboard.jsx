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
import { toast } from "react-toastify";
import { useAuth } from "../../hooks";
import { peso } from "../../utils";
import {
  Avatar,
  LinearProgress,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

const metrics = [
  {
    key: "totalSales",
    label: "Total Sales (Delivered)",
    icon: "fa-truck-ramp-box",
  },
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: "fa-bag-shopping",
  },
  { key: "totalUsers", label: "Total Users", icon: "fa-users" },
  {
    key: "totalProducts",
    label: "Total Products",
    icon: "fa-cubes",
  },
];

export default function Dashboard() {
  const brand =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--color-brand-500")
      .trim() || "#0059ff";
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("en-CA");
  const monthAgo = new Date(Date.now() - 29 * 86400000).toLocaleDateString(
    "en-CA",
  );
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [dash, setDash] = useState(null);
  const [tab, setTab] = useState("product");

  useEffect(() => {
    api
      .get("/admin/dashboard", { params: { from, to } })
      .then(({ data }) => setDash(data))
      .catch((err) => toast.error(err.message));
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
          borderColor: brand,
          borderWidth: 3,
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 320);
            g.addColorStop(0, brand + "40");
            g.addColorStop(1, brand + "00");
            return g;
          },
          fill: true,
          tension: 0.38,
          pointBackgroundColor: brand,
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
        backgroundColor: "#000000",
        titleFont: { family: "Inter", size: 13, weight: "bold" },
        bodyFont: { family: "Inter", size: 12 },
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (context) =>
            "Revenue: ₱" + Number(context.parsed.y).toLocaleString(),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: "Inter", size: 11, weight: "600" },
          color: "#64748B",
        },
      },
      y: {
        grid: { color: "#F1F5F9" },
        ticks: {
          font: { family: "Inter", size: 11, weight: "600" },
          color: "#64748B",
          callback: (value) =>
            "₱" +
            (value >= 1000000
              ? (value / 1000000).toFixed(1) + "M"
              : value >= 1000
                ? +(value / 1000).toFixed(1) + "K"
                : value),
        },
      },
    },
  };

  const items = dash?.breakdowns?.[tab] || [];

  return (
    <>
      <header className="flex items-center justify-between pb-3 mb-5">
        <div>
          <h2 className="font-fredoka text-2xl sm:text-3xl font-semibold text-black tracking-tight">
            Welcome back, {user?.name || "Admin"} 👋
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-0.5 font-medium">
            Here's what's happening with your store.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-6">
        {metrics.map((m) => (
          <div
            key={m.key}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-gray-400 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                {m.label}
              </span>
              <Avatar sx={{ bgcolor: "primary.light", color: "primary.main" }}>
                <i className={`fa-solid ${m.icon}`} />
              </Avatar>
            </div>
            <h3 className="text-2xl font-bold text-black tracking-tight">
              {m.key === "totalSales"
                ? peso(dash?.stats?.totalSales || 0)
                : (dash?.stats?.[m.key] ?? "—")}
            </h3>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-fredoka text-xl font-semibold text-black tracking-tight">
                Sales Overview
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                Historical revenue performance over time
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <TextField
                type="date"
                label="From"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: 170 }}
              />
              <TextField
                type="date"
                label="To"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: 170 }}
              />
            </div>
          </div>
          <div className="relative flex-1 min-h-[300px] w-full pt-2">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-fredoka text-xl font-semibold text-black tracking-tight mb-3">
            Top Breakdowns
          </h3>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={tab}
            onChange={(_, v) => v && setTab(v)}
            sx={{ mb: 1.5 }}
          >
            {["product", "category", "user"].map((t) => (
              <ToggleButton
                key={t}
                value={t}
                sx={{ textTransform: "capitalize", fontWeight: 700 }}
              >
                {t}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <div className="space-y-2.5">
            {items.map((item) => (
              <div key={item.name} className="py-1 space-y-1">
                <div className="flex justify-between items-baseline text-sm leading-tight">
                  <span className="font-extrabold text-black tracking-tight truncate max-w-[160px]">
                    {item.name}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-600 font-bold text-xs font-mono">
                      {peso(item.amount)}
                    </span>
                    <span className="font-black text-black text-sm tracking-tight w-11 text-right">
                      {item.percent}%
                    </span>
                  </div>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={Number(item.percent)}
                  sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover" }}
                />
              </div>
            ))}
            {!items.length && (
              <p className="text-sm text-gray-500">
                No delivered sales in this range.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
