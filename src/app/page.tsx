import { SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { PredictionList } from '@/components/predictions/prediction-list';
import {
  PageHeader,
  PageHeaderTitle,
  PageHeaderDescription,
} from '@/components/shared/page-header';
import { predictions } from '@/lib/data';

export default function MarketplacePage() {
  return (
    <SidebarInset>
      <AppHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <PageHeader>
          <PageHeaderTitle>Marketplace of Predictions</PageHeaderTitle>
          <PageHeaderDescription>
            Explore real-world events. Stake on your intuition. Win big.
          </PageHeaderDescription>
        </PageHeader>
        <PredictionList predictions={predictions} />
      </main>
    </SidebarInset>
  );
}
