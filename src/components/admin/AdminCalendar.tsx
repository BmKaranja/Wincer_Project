import React, { useState } from 'react';
import { motion } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminCalendar({ orders, inquiries }: { orders: any[], inquiries: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Combine orders and inquiries that have a date
  const ordersWithDate = orders.filter(o => o.deliveryDate).map(o => ({ ...o, _calDate: o.deliveryDate, _type: 'order' }));
  const inquiriesWithDate = inquiries.filter(i => i.eventDate).map(i => ({ ...i, _calDate: i.eventDate, _type: 'inquiry' }));
  const allEvents = [...ordersWithDate, ...inquiriesWithDate];

  // Pad the start of the calendar to align days correctly
  const prefixDays = Array.from({ length: getDay(monthStart) }).map((_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="bg-surface rounded-3xl p-6 md:p-8 border border-secondary/10 shadow-sm flex flex-col md:flex-row items-center md:justify-between gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-serif text-secondary font-bold mb-2">Calendar</h2>
          <p className="text-on-surface-variant text-sm font-medium opacity-70">Schedule production and delivery for upcoming events.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 bg-secondary/5 rounded-lg text-secondary hover:bg-secondary/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-serif font-bold text-secondary text-lg uppercase tracking-widest w-32 text-center">
            {format(currentDate, 'MMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-2 bg-secondary/5 rounded-lg text-secondary hover:bg-secondary/10 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-3xl border border-secondary/10 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-secondary/5 border-b border-secondary/10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-4 text-center text-[10px] font-bold uppercase tracking-widest text-secondary/60">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 border-b border-secondary/10 lg:min-h-[600px]">
          {prefixDays.map((_, i) => (
            <div key={`prefix-${i}`} className="min-h-24 border-r border-secondary/10 border-b p-2 bg-secondary/[0.02]" />
          ))}
          
          {daysInMonth.map((day, idx) => {
            const dayEvents = allEvents.filter(ev => {
              const evDate = new Date(ev._calDate);
              return isSameDay(evDate, day);
            });

            return (
              <div key={day.toString()} className={`min-h-24 border-r border-secondary/10 border-b p-2 transition-colors hover:bg-secondary/[0.02] ${isSameDay(day, new Date()) ? 'bg-secondary/5' : ''}`}>
                <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-2 ${isSameDay(day, new Date()) ? 'bg-secondary text-white' : 'text-secondary/60'}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="flex flex-col gap-1">
                  {dayEvents.slice(0, 3).map((ev, i) => (
                    <div key={i} className="bg-white border border-secondary/10 rounded-md p-1 px-2 text-[10px] truncate" title={`${ev.name || ev.customer}'s ${ev.occasionType || 'Order'}`}>
                      <span className="font-bold text-secondary mr-1">{ev.name || ev.customer}</span>
                      <span className="text-secondary/60">({ev.occasionType || 'Order'})</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-secondary/50 font-bold ml-1">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Suffix days to complete the grid */}
          {Array.from({ length: 42 - prefixDays.length - daysInMonth.length }).map((_, i) => (
            <div key={`suffix-${i}`} className="min-h-24 border-r border-secondary/10 border-b p-2 bg-secondary/[0.02]" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
