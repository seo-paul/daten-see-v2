import Link from 'next/link';

import { MainLayout } from '@/components/layout/MainLayout';

export default function Home(): React.ReactElement {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Willkommen bei Daten-See
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Ihr Analytics Dashboard für datengetriebene Entscheidungen
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/dashboard"
              className="inline-block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Dashboard öffnen
            </Link>
            <Link 
              href="/dashboards"
              className="inline-block w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Dashboard-Übersicht
            </Link>
          </div>

          <div className="mt-12 text-xs text-gray-500 bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-green-600 mb-2">✅ Task 1.5 Dashboard Layout implementiert</p>
            <div className="space-y-1 text-left">
              <p>• Top Navigation mit Logo und Benutzermenü</p>
              <p>• Dashboard Header mit Zeit-Filter und Aktionsbuttons</p>
              <p>• Grid Container für zukünftige Widgets</p>
              <p>• Responsive Design für alle Geräte</p>
            </div>
            <p className="mt-3 text-blue-600 font-medium">→ Nächster Schritt: Dashboard Management System</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}