'use client';

import { SimpleChart, SimpleKPICard } from '@/components/charts/SimpleChart';
import { CHART_COLORS } from '@/lib/charts/config';

/**
 * Simple Charts Demo Page
 * Showcases simplified chart components without Chart.js complexity
 */
export default function SimpleChartsDemoPage(): React.ReactElement {
  
  const monthlyData = [
    { label: 'Jan', value: 45000 },
    { label: 'Feb', value: 52000 },
    { label: 'Mär', value: 48000 },
    { label: 'Apr', value: 61000 },
    { label: 'Mai', value: 55000 },
    { label: 'Jun', value: 67000 },
    { label: 'Jul', value: 71000 },
    { label: 'Aug', value: 69000 },
    { label: 'Sep', value: 63000 },
    { label: 'Okt', value: 58000 },
    { label: 'Nov', value: 62000 },
    { label: 'Dez', value: 74000 },
  ];
  
  const categoryData = [
    { label: 'Marketing', value: 35000, color: CHART_COLORS.dataColors[0] },
    { label: 'Personal', value: 45000, color: CHART_COLORS.dataColors[1] },
    { label: 'Technologie', value: 25000, color: CHART_COLORS.dataColors[2] },
    { label: 'Büro', value: 15000, color: CHART_COLORS.dataColors[3] },
    { label: 'Sonstiges', value: 10000, color: CHART_COLORS.dataColors[4] },
  ];

  return (
    <div className="min-h-screen bg-[#FBF5ED] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-[#3d3d3d]">
            Charts Demo - Simplified Version
          </h1>
          <p className="text-[#5d5d5d] max-w-2xl mx-auto">
            Vereinfachte Chart-Komponenten mit Design System v2.3 Theming.
            Diese werden in Task 1.3.3 durch vollständige Chart.js Implementierungen ersetzt.
          </p>
        </div>
        
        {/* KPI Grid */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#3d3d3d]">
            KPI Metriken
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SimpleKPICard
              title="Gesamtumsatz"
              value={125000}
              previousValue={118000}
              unit="currency"
              color={CHART_COLORS.success}
            />
            <SimpleKPICard
              title="Neue Kunden"
              value={247}
              previousValue={234}
              unit="number"
              color={CHART_COLORS.primary}
            />
            <SimpleKPICard
              title="Konversionsrate"
              value={3.2}
              previousValue={2.8}
              unit="percentage"
              color={CHART_COLORS.info}
            />
            <SimpleKPICard
              title="Monatswachstum"
              value={8.5}
              previousValue={6.2}
              unit="percentage"
              color={CHART_COLORS.warning}
            />
          </div>
        </section>
        
        {/* Charts Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#3d3d3d]">
            Chart Komponenten
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <SimpleChart
              type="bar"
              title="Monatlicher Umsatz 2024"
              data={monthlyData}
              height={300}
            />
            
            {/* Line Chart */}
            <SimpleChart
              type="line"
              title="Umsatztrend über das Jahr"
              data={monthlyData}
              height={300}
            />
          </div>
          
          {/* Pie Chart */}
          <SimpleChart
            type="pie"
            title="Ausgaben nach Kategorien"
            data={categoryData}
            height={400}
          />
        </section>
        
        {/* Features Status */}
        <section className="bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-6">
          <h3 className="text-lg font-semibold text-[#3d3d3d] mb-4">
            🚧 Implementation Status - Task 1.3
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-[#3d3d3d] mb-2">✅ Completed:</h4>
              <ul className="space-y-1 text-[#5d5d5d]">
                <li>• Chart.js v4 + react-chartjs-2 installation</li>
                <li>• Design System v2.3 color integration</li>
                <li>• Basic chart component structure</li>
                <li>• Simplified demo implementations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[#3d3d3d] mb-2">🚧 Next Steps:</h4>
              <ul className="space-y-1 text-[#5d5d5d]">
                <li>• Fix Chart.js TypeScript compatibility (Task 1.3.3)</li>
                <li>• Implement responsive configurations</li>
                <li>• Add chart customization UI</li>
                <li>• Integrate with TanStack Query</li>
              </ul>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}