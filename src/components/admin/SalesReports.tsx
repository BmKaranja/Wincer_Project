import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#d1cbc2', '#8c8072', '#b3a99d', '#e5e1db', '#a39c94', '#605852'];

export default function SalesReports({ orders }: { orders: any[] }) {
  const { computedMonthData, flavorDataDisplay } = useMemo(() => {
    const monthDataMap: { [key: string]: number } = {};
    const flavorDataMap: { [key: string]: number } = {};
    
    orders.forEach(o => {
      // Process date
      if (o.createdAt) {
        let d = new Date();
        if (o.createdAt.seconds) {
          d = new Date(o.createdAt.seconds * 1000);
        } else if (typeof o.createdAt === 'string') {
          d = new Date(o.createdAt);
        } else if (typeof o.createdAt === 'number') {
          d = new Date(o.createdAt);
        }

        const month = d.toLocaleString('default', { month: 'short' });
        // Clean amount, e.g. "Ksh 2.23k" -> 2230, "KES 20,000" -> 20000
        const strAmt = String(o.amount || '').toLowerCase().replace(/kshs?\.?|kes\.?|,/g, '').trim();
        let mult = 1;
        if (strAmt.endsWith('k')) mult = 1000;
        if (strAmt.endsWith('m')) mult = 1000000;
        const amount = (parseFloat(strAmt.replace(/[^0-9.-]+/g,"")) || 0) * mult;
        monthDataMap[month] = (monthDataMap[month] || 0) + amount;
      }
      
      // Process flavors
      const details = (o.cakeTitle || '') + ' ' + (o.cakeDetails || '');
      const t = details.toLowerCase();
      if (t) {
        let flavor = 'Other';
        if (t.includes('vanilla')) flavor = 'Vanilla';
        else if (t.includes('chocolate') || t.includes('fudge')) flavor = 'Chocolate';
        else if (t.includes('red velvet')) flavor = 'Red Velvet';
        else if (t.includes('lemon')) flavor = 'Lemon';
        else if (t.includes('strawberry')) flavor = 'Strawberry';
        
        flavorDataMap[flavor] = (flavorDataMap[flavor] || 0) + 1;
      }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentDate = new Date();
    const displayMonths = [];
    for (let i = 5; i >= 0; i--) {
      let d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      displayMonths.push(monthNames[d.getMonth()]);
    }

    const computedMonthData = displayMonths.map(m => ({
      name: m,
      sales: monthDataMap[m] || 0
    }));

    const computedFlavorData = Object.keys(flavorDataMap).map(f => ({
      name: f,
      value: flavorDataMap[f]
    })).sort((a,b) => b.value - a.value);

    // fallback so chart rendering doesnt crash if no orders
    const flavorDataDisplay = computedFlavorData.length > 0 ? computedFlavorData : [
      { name: 'No Data', value: 1 },
    ];

    return { computedMonthData, flavorDataDisplay };
  }, [orders]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="bg-surface rounded-3xl p-8 border border-secondary/10 shadow-sm">
        <div>
          <h2 className="text-xl font-serif text-secondary font-bold mb-2">Sales Reports</h2>
          <p className="text-on-surface-variant text-sm font-medium opacity-70">Track monthly trends and popular requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Bar Chart */}
        <div className="bg-surface rounded-3xl p-4 md:p-8 border border-secondary/10 shadow-sm">
          <h3 className="font-serif text-secondary font-bold mb-4 md:mb-6">Recent Monthly Sales</h3>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computedMonthData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8c8072' }} axisLine={false} tickLine={false} />
                <YAxis width={45} tick={{ fontSize: 11, fill: '#8c8072' }} axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val} />
                <Tooltip cursor={{ fill: '#f5f4f2' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} formatter={(value) => `KES ${value}`} />
                <Bar dataKey="sales" fill="#8c8072" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-surface rounded-3xl p-4 md:p-8 border border-secondary/10 shadow-sm">
          <h3 className="font-serif text-secondary font-bold mb-4 md:mb-6">Popular Flavors</h3>
          <div className="h-64 sm:h-72 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={flavorDataDisplay}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {flavorDataDisplay.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#8c8072' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
