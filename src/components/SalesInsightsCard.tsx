import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Award, Calendar } from 'lucide-react';
import { Order } from '../types.ts';

interface SalesInsightsCardProps {
  orders: Order[];
  className?: string;
}

type TimeWindow = '7D' | '14D' | '30D';

export const SalesInsightsCard: React.FC<SalesInsightsCardProps> = ({
  orders,
  className = '',
}) => {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('30D');

  const daysCount = timeWindow === '7D' ? 7 : timeWindow === '14D' ? 14 : 30;

  // Generate continuous chronological timeline filling empty days
  const chartData = useMemo(() => {
    const list: {
      date: string;
      fullDate: string;
      revenue: number;
      orderCount: number;
      avgOrderValue: number;
    }[] = [];

    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() - i);

      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const shortLabel = targetDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      });
      const fullLabel = targetDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      // Filter orders matching this calendar day (ignore Cancelled orders)
      const dayOrders = orders.filter((o) => {
        if (o.status === 'Cancelled') return false;
        const oDate = new Date(o.createdAt);
        const oYear = oDate.getFullYear();
        const oMonth = String(oDate.getMonth() + 1).padStart(2, '0');
        const oDay = String(oDate.getDate()).padStart(2, '0');
        return `${oYear}-${oMonth}-${oDay}` === dateKey;
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const dayCount = dayOrders.length;
      const dayAov = dayCount > 0 ? Math.round(dayRevenue / dayCount) : 0;

      list.push({
        date: shortLabel,
        fullDate: fullLabel,
        revenue: dayRevenue,
        orderCount: dayCount,
        avgOrderValue: dayAov,
      });
    }

    return list;
  }, [orders, daysCount]);

  // Aggregate KPI metrics for the selected time window
  const metrics = useMemo(() => {
    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrdersCount = chartData.reduce((sum, d) => sum + d.orderCount, 0);
    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    let peakDay = { revenue: 0, date: 'None' };
    chartData.forEach((d) => {
      if (d.revenue > peakDay.revenue) {
        peakDay = { revenue: d.revenue, date: d.date };
      }
    });

    return {
      totalRevenue,
      totalOrdersCount,
      avgOrderValue,
      peakDay,
    };
  }, [chartData]);

  // Custom Interactive Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[170px] animate-in fade-in zoom-in-95">
          <p className="font-semibold text-slate-300 pb-1 border-b border-slate-800 flex items-center justify-between text-[11px]">
            <span>{item.fullDate}</span>
            <span className="font-mono text-emerald-400 font-bold">{item.date}</span>
          </p>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#168A45]" />
              Revenue:
            </span>
            <span className="font-mono font-bold text-white text-sm">
              ₹{item.revenue.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
              Order Volume:
            </span>
            <span className="font-mono font-bold text-slate-200">
              {item.orderCount} {item.orderCount === 1 ? 'order' : 'orders'}
            </span>
          </div>

          {item.orderCount > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
              <span>Avg Basket:</span>
              <span className="font-mono font-semibold text-amber-300">
                ₹{item.avgOrderValue.toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5 ${className}`}>
      {/* Top Header & Range Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#168A45] flex items-center justify-center border border-emerald-100 shadow-2xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Sales Insights
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily revenue and total order volume over the last {daysCount} days
            </p>
          </div>
        </div>

        {/* Time Window Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
          {(['7D', '14D', '30D'] as TimeWindow[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTimeWindow(tab)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                timeWindow === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === '7D' ? '7 Days' : tab === '14D' ? '14 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary KPI Callout Strips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Revenue */}
        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/70">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-[#168A45]" />
            <span>{daysCount}-Day Revenue</span>
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-[#168A45] font-mono tabular-nums mt-1">
            ₹{metrics.totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Accumulated COD & PhonePe
          </span>
        </div>

        {/* Metric 2: Orders Count */}
        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/70">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
            <ShoppingCart className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>Total Orders</span>
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
            {metrics.totalOrdersCount}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Confirmed grocery deliveries
          </span>
        </div>

        {/* Metric 3: AOV */}
        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/70">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Avg Order Value</span>
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
            ₹{metrics.avgOrderValue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Per transaction basket
          </span>
        </div>

        {/* Metric 4: Peak Sales */}
        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/70">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Peak Sales Day</span>
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
            ₹{metrics.peakDay.revenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block font-semibold">
            {metrics.peakDay.revenue > 0 ? `on ${metrics.peakDay.date}` : 'No orders yet'}
          </span>
        </div>
      </div>

      {/* Dynamic Recharts Composed Chart (Dual Y-Axis: Revenue Area + Order Volume Bar) */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="salesRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#168A45" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#168A45" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#64748B' }}
              interval={daysCount > 14 ? 3 : 1}
            />

            {/* Left Y-Axis: Daily Revenue in INR */}
            <YAxis
              yAxisId="revenue"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#168A45', fontWeight: 600 }}
              tickFormatter={(v) => `₹${v}`}
              domain={[0, 'auto']}
            />

            {/* Right Y-Axis: Total Order Volume */}
            <YAxis
              yAxisId="orders"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6366F1', fontWeight: 600 }}
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.max(dataMax + 1, 4)]}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
              formatter={(value) => (
                <span className="text-slate-600 font-semibold">{value}</span>
              )}
            />

            {/* Secondary Bar: Order Volume */}
            <Bar
              yAxisId="orders"
              name="Order Volume (Count)"
              dataKey="orderCount"
              fill="#6366F1"
              radius={[4, 4, 0, 0]}
              maxBarSize={daysCount > 14 ? 12 : 20}
            />

            {/* Primary Area: Daily Revenue */}
            <Area
              yAxisId="revenue"
              type="monotone"
              name="Daily Revenue (₹)"
              dataKey="revenue"
              stroke="#168A45"
              strokeWidth={2.5}
              fill="url(#salesRevenueGrad)"
              activeDot={{ r: 5, fill: '#168A45', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
