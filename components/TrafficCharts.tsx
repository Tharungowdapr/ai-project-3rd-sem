
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector, PieLabelRenderProps, AreaChart, Area } from 'recharts';
import { LogEntry, ObjectTypeDistribution, OverallDetectionDistribution, CongestionLevel } from '../types';
// Removed ChartBarIcon as it's not used in the simplified title
interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  height?: string;
}

// Chart Colors from Image Theme (defined in tailwind.config.js and used here)
const CHART_COLORS_THEME = {
  lineBlue: 'var(--color-chart-line-blue)', // Use CSS variables if Tailwind colors are directly accessible
  lineTeal: 'var(--color-chart-line-teal)', // Or pass hex codes directly if not. For simplicity, using hex.
  pieBlue1: '#3B82F6',
  pieTeal: '#14B8A6',
  pieOrange: '#F97316',
  pieRed: '#EF4444',
  pieBlue2: '#2563EB',
  barYellow: '#FACC15',

  // For multi-series charts if not covered above
  vehicles: '#3B82F6',   // Blue-500 from theme
  humans: '#AB47BC',     // Recharts default purple / or a theme color like accent-red if humans are "alert"
  animals: '#F59E0B',    // Amber-500 from theme (accent-orange)
};


const ChartCard: React.FC<ChartContainerProps> = ({ title, children, height = "h-80" }) => (
  <div className={`bg-background-card p-4 rounded-lg shadow-elevation-medium border border-border-ui-default ${height} flex flex-col`}>
    <h3 className="text-lg font-semibold mb-3 text-content-display"> {/* Simplified title */}
      {title}
    </h3>
    <div className="flex-grow">
      {children}
    </div>
  </div>
);


interface TrafficMultiLineChartProps {
  data: LogEntry[];
  title: string;
}

export const TrafficMultiLineChart: React.FC<TrafficMultiLineChartProps> = ({ data, title }) => {
  const chartData = data.map(entry => ({
    time: entry.relativeTime.toFixed(1),
    vehicles: entry.vehicles.total,
    humans: entry.humans.total,
    animals: entry.animals.total,
  }));

  return (
    <ChartCard title={title} height="h-96">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 25, left: -15, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" /> {/* Slate-500 with opacity */}
            <XAxis dataKey="time" stroke="#94A3B8" tick={{fontSize: 10, fill: "#94A3B8"}} label={{ value: "Time (s)", position: "insideBottom", offset: -18, fontSize: 11, fill: "#94A3B8"}}/>
            <YAxis stroke="#94A3B8" tick={{fontSize: 10, fill: "#94A3B8"}} label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: "#94A3B8" }} allowDecimals={false}/>
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.95)', borderRadius: '8px', borderColor: '#334155', color: '#E2E8F0' }} 
              itemStyle={{ color: '#E2E8F0' }}
              labelStyle={{ color: CHART_COLORS_THEME.pieBlue1, fontWeight: 'bold', marginBottom: '5px' }}
            />
            <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}} formatter={(value) => <span style={{color: '#94A3B8'}}>{value}</span>}/>
            <Line type="monotone" dataKey="vehicles" stroke={CHART_COLORS_THEME.vehicles} strokeWidth={2} dot={{ r: 2, fill: CHART_COLORS_THEME.vehicles }} activeDot={{ r: 5, stroke: CHART_COLORS_THEME.pieTeal, fill: CHART_COLORS_THEME.vehicles }} name="Vehicles" />
            <Line type="monotone" dataKey="humans" stroke={CHART_COLORS_THEME.humans} strokeWidth={2} dot={{ r: 2, fill: CHART_COLORS_THEME.humans }} activeDot={{ r: 5, stroke: CHART_COLORS_THEME.pieTeal, fill: CHART_COLORS_THEME.humans }} name="Humans" />
            <Line type="monotone" dataKey="animals" stroke={CHART_COLORS_THEME.animals} strokeWidth={2} dot={{ r: 2, fill: CHART_COLORS_THEME.animals }} activeDot={{ r: 5, stroke: CHART_COLORS_THEME.pieTeal, fill: CHART_COLORS_THEME.animals }} name="Animals" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-content-muted">NO DATA STREAM DETECTED</div>
      )}
    </ChartCard>
  );
};

interface ObjectPieChartProps {
  data: ObjectTypeDistribution[] | OverallDetectionDistribution[];
  title: string;
  colors?: string[] | Record<string, string>; 
}

const DEFAULT_PIE_COLORS_IMG = [CHART_COLORS_THEME.pieBlue1, CHART_COLORS_THEME.pieTeal, CHART_COLORS_THEME.pieOrange, CHART_COLORS_THEME.pieRed, CHART_COLORS_THEME.pieBlue2, CHART_COLORS_THEME.barYellow];

const RADIAN = Math.PI / 180;
const renderCustomizedPieLabel: React.FC<PieLabelRenderProps & {nameKey?: string}> = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
  if (typeof cx !== 'number' || typeof cy !== 'number' || typeof innerRadius !== 'number' || typeof outerRadius !== 'number' || typeof midAngle !== 'number' || typeof percent !== 'number' || !name) {
    return null;
  }
  const radius = innerRadius + (outerRadius - innerRadius) * 0.65; // Adjusted for better fit
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05 && (outerRadius - innerRadius < 50)) return null; 

  return (
    <text x={x} y={y} fill="#FFFFFF" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="medium" className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
      {`${name.length > 7 ? name.substring(0,6)+'…' : name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

export const ObjectTypePieChart: React.FC<ObjectPieChartProps> = ({ data, title, colors }) => {
  const validData = data.filter(item => item.value > 0);
  const colorMapping = colors || DEFAULT_PIE_COLORS_IMG;

  return (
    <ChartCard title={title} height="h-80">
      {validData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
            <Pie
              data={validData}
              cx="50%"
              cy="45%" 
              labelLine={false}
              label={renderCustomizedPieLabel}
              outerRadius={90} // Slightly larger pie
              innerRadius={40} 
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              stroke="#161A27" // Card background color for stroke
              strokeWidth={2}
            >
              {validData.map((entry, index) => {
                let fillColor: string;
                if (Array.isArray(colorMapping)) {
                    fillColor = colorMapping[index % colorMapping.length];
                } else {
                    const keyName = (entry as OverallDetectionDistribution).name || (entry as ObjectTypeDistribution).name;
                    fillColor = colorMapping[keyName] || DEFAULT_PIE_COLORS_IMG[index % DEFAULT_PIE_COLORS_IMG.length];
                }
                return <Cell key={`cell-${index}`} fill={fillColor} />;
              })}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.95)', borderRadius: '8px', borderColor: '#334155', color: '#E2E8F0' }}
              itemStyle={{ color: '#E2E8F0' }}
              labelStyle={{ color: CHART_COLORS_THEME.pieBlue1, fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{fontSize: "11px", paddingTop: "5px", lineHeight: "1.5"}} iconSize={10} formatter={(value) => <span style={{color: '#94A3B8'}}>{value}</span>}/>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-content-muted">NO DISTRIBUTION DATA</div>
      )}
    </ChartCard>
  );
};


export const StackedAreaChartComponent: React.FC<TrafficMultiLineChartProps> = ({ data, title }) => {
  const chartData = data.map(entry => ({
    time: entry.relativeTime.toFixed(1),
    vehicles: entry.vehicles.total,
    humans: entry.humans.total,
    animals: entry.animals.total,
  }));

  return (
    <ChartCard title={title} height="h-96">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 25, left: -15, bottom: 25 }}>
            <defs>
              <linearGradient id="colorVehiclesStackedImg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS_THEME.vehicles} stopOpacity={0.6}/>
                <stop offset="95%" stopColor={CHART_COLORS_THEME.vehicles} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorHumansStackedImg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS_THEME.humans} stopOpacity={0.6}/>
                <stop offset="95%" stopColor={CHART_COLORS_THEME.humans} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorAnimalsStackedImg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS_THEME.animals} stopOpacity={0.6}/>
                <stop offset="95%" stopColor={CHART_COLORS_THEME.animals} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
            <XAxis dataKey="time" stroke="#94A3B8" tick={{fontSize: 10, fill: "#94A3B8"}} label={{ value: "Time (s)", position: "insideBottom", offset: -18, fontSize: 11, fill: "#94A3B8"}}/>
            <YAxis stroke="#94A3B8" tick={{fontSize: 10, fill: "#94A3B8"}} label={{ value: 'Total Count', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: "#94A3B8" }} allowDecimals={false}/>
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.95)', borderRadius: '8px', borderColor: '#334155', color: '#E2E8F0' }}
              itemStyle={{ color: '#E2E8F0' }}
              labelStyle={{ color: CHART_COLORS_THEME.pieBlue1, fontWeight: 'bold', marginBottom: '5px' }}
            />
            <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}} formatter={(value) => <span style={{color: '#94A3B8'}}>{value}</span>}/>
            <Area type="monotone" dataKey="vehicles" stackId="1" stroke={CHART_COLORS_THEME.vehicles} fillOpacity={1} fill="url(#colorVehiclesStackedImg)" name="Vehicles" />
            <Area type="monotone" dataKey="humans" stackId="1" stroke={CHART_COLORS_THEME.humans} fillOpacity={1} fill="url(#colorHumansStackedImg)" name="Humans" />
            <Area type="monotone" dataKey="animals" stackId="1" stroke={CHART_COLORS_THEME.animals} fillOpacity={1} fill="url(#colorAnimalsStackedImg)" name="Animals" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-content-muted">NO DATA STREAM DETECTED</div>
      )}
    </ChartCard>
  );
};


interface CongestionIncidentTimelineProps {
  data: LogEntry[];
  title: string;
}

export const CongestionIncidentTimeline: React.FC<CongestionIncidentTimelineProps> = ({ data, title }) => {
  const chartData = data.map(entry => ({
    time: entry.relativeTime.toFixed(1),
    congestion: entry.congestion === CongestionLevel.High ? 3 : entry.congestion === CongestionLevel.Medium ? 2 : 1,
    incident: entry.incident ? 3.5 : null, 
  }));

  return (
    <ChartCard title={title} height="h-96">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 25, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
            <XAxis dataKey="time" stroke="#94A3B8" tick={{fontSize: 10, fill: "#94A3B8"}} label={{ value: "Time (s)", position: "insideBottom", offset: -18, fontSize: 11, fill: "#94A3B8"}}/>
            <YAxis
              stroke="#94A3B8"
              tick={{fontSize: 10, fill: "#94A3B8"}}
              label={{ value: 'Status Level', angle: -90, position: 'insideLeft', offset:10, fontSize: 11, fill: "#94A3B8" }}
              domain={[0, 4]}
              ticks={[1, 2, 3]}
              tickFormatter={(value) => {
                if (value === 1) return 'Low';
                if (value === 2) return 'Medium';
                if (value === 3) return 'High';
                return '';
              }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.95)', borderRadius: '8px', borderColor: '#334155', color: '#E2E8F0' }}
              labelStyle={{ color: CHART_COLORS_THEME.pieBlue1, fontWeight: 'bold', marginBottom: '5px' }}
              formatter={(value: number, name: string) => {
                if (name === 'Congestion') {
                    if (value === 1) return ['Low', name];
                    if (value === 2) return ['Medium', name];
                    if (value === 3) return ['High', name];
                }
                if (name === 'Incident' && value) return ['DETECTED', name];
                return null; 
              }}
            />
            <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}} formatter={(value) => <span style={{color: '#94A3B8'}}>{value}</span>}/>
            <Line type="stepAfter" dataKey="congestion" stroke={CHART_COLORS_THEME.pieBlue1} strokeWidth={2} name="Congestion" dot={false} activeDot={{r:4, fill: CHART_COLORS_THEME.pieBlue1}} />
            <Line type="monotone" dataKey="incident" strokeWidth={0} name="Incident" 
                dot={{ r: 5, fill: CHART_COLORS_THEME.pieRed, strokeWidth:0 }} 
                activeDot={{r:7, fill: CHART_COLORS_THEME.pieRed, stroke: CHART_COLORS_THEME.pieRed}} connectNulls={false}/>
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-content-muted">NO DATA STREAM DETECTED</div>
      )}
    </ChartCard>
  );
};
