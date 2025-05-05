'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface Props {
  data: { name: string; value: number; color: string }[]
  total: number
}

export default function DashboardChart({ data, total }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
      {data.map((entry, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center text-white"
        >
          <div className="h-[120px] w-[120px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    entry,
                    { name: 'restante', value: total - entry.value },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={55}
                  innerRadius={30}
                  startAngle={90}
                  endAngle={450}
                >
                  <Cell fill={entry.color} />
                  <Cell fill="#1f2937" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
              {entry.value}
            </div>
          </div>
          <span className="mt-2 text-sm text-zinc-300">{entry.name}</span>
        </div>
      ))}
    </div>
  )
}
