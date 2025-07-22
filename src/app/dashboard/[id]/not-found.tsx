import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { MainLayout } from '@/components/layout/MainLayout';

export default function DashboardNotFound(): React.ReactElement {
  return (
    <MainLayout>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-dashed rounded"></div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard nicht gefunden
          </h1>
          
          <p className="text-gray-600 mb-6">
            Das Dashboard mit dieser ID existiert nicht oder wurde gelöscht.
          </p>
          
          <Link
            href="/dashboards"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}