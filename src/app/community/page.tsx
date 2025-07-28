import { MainLayout } from '@/components/layout/MainLayout';

export default function CommunityPage(): React.ReactElement {
  return (
    <MainLayout>
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-[#3d3d3d] mb-6">
            Community
          </h1>
          
          <div className="bg-[#FDF9F3] rounded-lg border border-[#E6D7B8] p-8">
            <div className="text-center text-[#5d5d5d]">
              <p className="text-lg font-medium mb-2">Community-Bereich</p>
              <p className="text-sm text-[#3d3d3d]/70">
                Wird in späteren Phasen implementiert
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}