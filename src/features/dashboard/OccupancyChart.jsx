import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#0b4f8a", "#22a06b", "#64748b"];

export default function OccupancyChart({ data, occupancyRate }) {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Room Occupancy</h2>
          <p className="mt-1 text-[11px] text-slate-400">
            Current room status distribution
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#0b4f8a]">
          {occupancyRate}% occupied
        </span>
      </div>

      <div className="mt-2 h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={84}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((item, index) => (
                <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name) => [
                `${value} room${value === 1 ? "" : "s"}`,
                name,
              ]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                fontSize: 12,
              }}
            />

            <text
              x="50%"
              y="47%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-900 text-[22px] font-bold"
            >
              {occupancyRate}%
            </text>
            <text
              x="50%"
              y="57%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-400 text-[10px]"
            >
              Occupied
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
        {data.map((item, index) => (
          <div key={item.name} className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-[10px] text-slate-400">{item.name}</span>
            </div>
            <p className="mt-1 text-sm font-bold text-slate-700">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
