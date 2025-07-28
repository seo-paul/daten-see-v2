import Link from 'next/link';

import { MainLayout } from '@/components/layout/MainLayout';

export default function Home(): React.ReactElement {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-3xl font-bold text-[#3d3d3d] mb-4">
            Willkommen bei Daten-See
          </h1>
          <p className="text-lg text-[#5d5d5d] mb-8">
            Ihr Analytics Dashboard für datengetriebene Entscheidungen
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/dashboard"
              className="inline-block w-full px-6 py-3 bg-[#2F4F73] text-white font-medium rounded-lg hover:bg-[#365c83] transition-colors"
            >
              Dashboard öffnen
            </Link>
            <Link 
              href="/dashboards"
              className="inline-block w-full px-6 py-3 border border-[#E6D7B8] text-[#3d3d3d] font-medium rounded-lg hover:bg-[#FDF9F3] transition-colors"
            >
              Dashboard-Übersicht
            </Link>
          </div>

          <div className="mt-12 text-xs text-[#5d5d5d] bg-[#FDF9F3] p-4 rounded-lg border border-[#E6D7B8]">
            <p className="font-medium text-[#2F4F73] mb-2">✅ Task 1.2.2 Modular Header System implementiert</p>
            <div className="space-y-1 text-left">
              <p>• Logo bleibt immer links bestehen</p>
              <p>• Navigationsinhalte variieren je nach Seite</p>
              <p>• Dashboard-Übersicht Button nur auf relevanten Seiten</p>
              <p>• Dashboard-Detail-Seiten behalten ihren Header</p>
            </div>
            <p className="mt-3 text-[#2F4F73] font-medium">→ Nächster Schritt: Auth-Seiten Design System Update</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}