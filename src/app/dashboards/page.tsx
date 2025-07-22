import { MainLayout } from '@/components/layout/MainLayout';

export default function DashboardsOverviewPage(): React.ReactElement {
  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Dashboard-Übersicht
          </h1>
          
          {/* Placeholder for dashboard list */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-dashed rounded"></div>
              </div>
              <p className="text-lg font-medium mb-2">Noch keine Dashboards</p>
              <p className="text-sm text-gray-400 mb-4">
                Dashboard Management wird in Task 1.5B implementiert
              </p>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                disabled
              >
                Neues Dashboard erstellen
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}