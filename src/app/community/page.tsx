import { MainLayout } from '@/components/layout/MainLayout';

export default function CommunityPage(): React.ReactElement {
  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Community
          </h1>
          
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">Community-Bereich</p>
              <p className="text-sm text-gray-400">
                Wird in späteren Phasen implementiert
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}