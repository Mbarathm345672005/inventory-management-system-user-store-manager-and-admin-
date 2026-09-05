import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ForecastChart = ({ data }) => {
  const [isDark, setIsDark] = useState(() => document.body.classList.contains('dark-theme'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark-theme'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
        <p className="text-muted">No trend data available.</p>
      </div>
    );
  }

  // Legend formatter to color labels based on active theme
  const renderLegendText = (value) => {
    return (
      <span style={{ color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600, fontSize: '0.85rem' }}>
        {value}
      </span>
    );
  };

  return (
    <div style={{ width: '100%', height: 350 }}>
      <h5 className="text-center mb-3 fw-bold">Sales History vs. AI Prediction</h5>
      <div style={{ 
        width: '100%', 
        height: 290, 
        backgroundColor: isDark ? '#0f172a' : 'transparent', 
        borderRadius: '8px', 
        padding: '16px 16px 0 0',
        transition: 'background-color 250ms ease'
      }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 11 }} 
              stroke={isDark ? '#334155' : '#cbd5e0'}
              tickFormatter={(str) => {
                const d = new Date(str);
                return `${d.getMonth()+1}/${d.getDate()}`;
              }}
            />
            <YAxis 
              allowDecimals={false} 
              tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 11 }}
              stroke={isDark ? '#334155' : '#cbd5e0'}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? '#17233a' : '#ffffff', 
                borderColor: isDark ? '#334155' : '#cbd5e0', 
                color: isDark ? '#f8fafc' : '#0f172a', 
                borderRadius: '8px',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.35)' : '0 4px 12px rgba(0,0,0,0.08)'
              }}
              itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
              labelStyle={{ color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={renderLegendText}
            />
            
            {/* 1. Historical Data Line (Blue, Solid) */}
            <Line 
              connectNulls 
              type="monotone" 
              dataKey="Sales" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 4, stroke: '#3b82f6', fill: isDark ? '#60a5fa' : '#3b82f6', strokeWidth: 1 }}
              activeDot={{ r: 6 }}
              name="Past Sales" 
            />

            {/* 2. Forecast Data Line (Red, Dashed) */}
            <Line 
              connectNulls 
              type="monotone" 
              dataKey="Forecast" 
              stroke="#f87171" 
              strokeWidth={3}
              strokeDasharray="5 5" 
              dot={{ r: 4, stroke: '#f87171', fill: isDark ? '#fb7185' : '#dc3545', strokeWidth: 1 }}
              activeDot={{ r: 6 }}
              name="AI Prediction (Next 7 Days)" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastChart;