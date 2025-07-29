'use client';

import Link from 'next/link';

import { 
  DashboardLineChart, 
  DashboardBarChart, 
  DashboardPieChart,
  DashboardDoughnutChart,
  DashboardKPICard,
  CHART_COLORS 
} from '@/components/charts';

/**
 * Chart Components Demo Page
 * Showcases all available chart components and their features
 */
export default function ChartsDemoPage(): React.ReactElement {
  
  // Chart.js format data
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    datasets: [{
      label: 'Umsatz 2024',
      data: [45000, 52000, 48000, 61000, 55000, 67000, 71000, 69000, 63000, 58000, 62000, 74000],
    }]
  };
  
  const categoryData = {
    labels: ['Marketing', 'Personal', 'Technologie', 'Büro', 'Sonstiges'],
    datasets: [{
      label: 'Ausgaben',
      data: [35000, 45000, 25000, 15000, 10000],
    }]
  };

  const quarterlyComparison = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: '2023',
        data: [125000, 163000, 183000, 175000],
      },
      {
        label: '2024', 
        data: [145000, 183000, 203000, 196000],
      }
    ]
  };
  
  const trendData = [45, 52, 48, 61, 55, 67, 71, 69, 63, 58, 62, 74];

  return (
    <div className="min-h-screen bg-[#FBF5ED] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-[#3d3d3d]">
            📊 Chart Components Demo
          </h1>
          <p className="text-[#5d5d5d] max-w-2xl mx-auto">
            Professionelle Chart-Komponenten mit Design System v2.3 Integration.
            Diese Demo zeigt die verfügbaren Visualisierungsoptionen für BI-Dashboards.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/charts-demo-simple"
              className="px-4 py-2 bg-[#2F4F73] text-white rounded-lg hover:bg-[#365C83] transition-colors"
            >
              Simplified Version
            </Link>
            <Link 
              href="/" 
              className="px-4 py-2 bg-[#FDF9F3] text-[#3d3d3d] border border-[#E6D7B8] rounded-lg hover:bg-[#F5EFE7] transition-colors"
            >
              ← Zurück zur Hauptseite
            </Link>
          </div>
        </div>
        
        {/* KPI Metrics Section */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-[#3d3d3d] mb-2">
              📈 KPI Dashboard
            </h2>
            <p className="text-[#5d5d5d]">
              Key Performance Indicators mit Trend-Analysen
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardKPICard
              title="Gesamtumsatz"
              value={125000}
              previousValue={118000}
              unit="currency"
              color={CHART_COLORS.success}
              trend="up"
              trendData={trendData}
            />
            <DashboardKPICard
              title="Neue Kunden"
              value={247}
              previousValue={234}
              unit="number"
              color={CHART_COLORS.primary}
              trend="up"
            />
            <DashboardKPICard
              title="Konversionsrate"
              value={3.2}
              previousValue={2.8}
              unit="percentage"
              color={CHART_COLORS.info}
              trend="up"
            />
            <DashboardKPICard
              title="Monatswachstum"
              value={8.5}
              previousValue={6.2}
              unit="percentage"
              color={CHART_COLORS.warning}
              trend="up"
            />
          </div>
        </section>
        
        {/* Chart Types Section */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-[#3d3d3d] mb-2">
              📊 Chart-Typen Übersicht
            </h2>
            <p className="text-[#5d5d5d]">
              Verschiedene Visualisierungsoptionen für unterschiedliche Datentypen
            </p>
          </div>
          
          {/* Time Series Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardLineChart
              title="Umsatzentwicklung 2024"
              data={monthlyData}
              height={300}
            />
            <DashboardBarChart
              title="Quartalsvergleich"
              data={quarterlyComparison}
              height={300}
            />
          </div>
          
          {/* Composition Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardPieChart
              title="Ausgabenverteilung nach Kategorien"
              data={categoryData}
              height={350}
            />
            <DashboardDoughnutChart
              title="Kostenverteilung"
              data={categoryData}
              height={350}
              centerText="Gesamt"
              centerValue="130.000€"
            />
          </div>
        </section>
        
        {/* Implementation Status */}
        <section className="bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-6">
          <h3 className="text-lg font-semibold text-[#3d3d3d] mb-4">
            🚧 Task 1.3 - Implementation Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            
            {/* Completed Features */}
            <div>
              <h4 className="font-medium text-[#3d3d3d] mb-3 flex items-center">
                ✅ Completed Features
              </h4>
              <ul className="space-y-2 text-[#5d5d5d]">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Chart.js v4 + react-chartjs-2 Installation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Design System v2.3 Farb-Integration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>4 Core Chart Components (Line, Bar, Pie, KPI)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Simplified Chart Implementations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Professional Demo Page</span>
                </li>
              </ul>
            </div>
            
            {/* Next Steps */}
            <div>
              <h4 className="font-medium text-[#3d3d3d] mb-3 flex items-center">
                🔄 Next Implementation Steps
              </h4>
              <ul className="space-y-2 text-[#5d5d5d]">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Task 1.3.3:</strong> Mobile responsive configuration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Task 1.3.4:</strong> Chart customization UI</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Task 1.3.5:</strong> TanStack Query integration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>Chart.js TypeScript compatibility fixes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Advanced Chart.js features & animations</span>
                </li>
              </ul>
            </div>
            
          </div>
          
          {/* Technical Notes */}
          <div className="mt-6 p-4 bg-[#F5EFE7] rounded-lg">
            <h4 className="font-medium text-[#3d3d3d] mb-2">
              ⚙️ Technical Implementation Notes
            </h4>
            <ul className="text-sm text-[#5d5d5d] space-y-1">
              <li>• <strong>Current Approach:</strong> Hybrid implementation with simplified components as fallback</li>
              <li>• <strong>TypeScript Issues:</strong> Chart.js strict mode compatibility deferred to Task 1.3.3</li>
              <li>• <strong>Design System:</strong> Full v2.3 color palette integration complete</li>
              <li>• <strong>Performance:</strong> SVG-based fallbacks ensure smooth rendering on all devices</li>
            </ul>
          </div>
        </section>
        
        {/* Feature Showcase Grid */}
        <section className="bg-gradient-to-br from-[#FDF9F3] to-[#F5EFE7] rounded-lg border border-[#E6D7B8] p-6">
          <h3 className="text-lg font-semibold text-[#3d3d3d] mb-4 text-center">
            🎯 Chart Features & Capabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-medium text-[#3d3d3d]">Time Series</h4>
              <p className="text-[#5d5d5d]">Line charts für zeitbasierte Datenanalyse</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-medium text-[#3d3d3d]">Comparisons</h4>
              <p className="text-[#5d5d5d]">Bar charts für Kategorienvergleiche</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">🥧</div>
              <h4 className="font-medium text-[#3d3d3d]">Composition</h4>
              <p className="text-[#5d5d5d]">Pie charts für Teil-Ganzes-Verhältnisse</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-medium text-[#3d3d3d]">Design System</h4>
              <p className="text-[#5d5d5d]">Konsistente v2.3 Farbpalette</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">📱</div>
              <h4 className="font-medium text-[#3d3d3d]">Responsive</h4>
              <p className="text-[#5d5d5d]">Mobile-optimierte Darstellung</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-medium text-[#3d3d3d]">Performance</h4>
              <p className="text-[#5d5d5d]">Schnelle SVG-basierte Rendering</p>
            </div>
            
          </div>
        </section>
        
      </div>
    </div>
  );
}