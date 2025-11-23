import { SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import {
  PageHeader,
  PageHeaderTitle,
  PageHeaderDescription,
} from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function CommunitiesPage() {
  return (
    <SidebarInset>
      <AppHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <PageHeader>
          <PageHeaderTitle>Communities</PageHeaderTitle>
          <PageHeaderDescription>
            Join category-based communities. Follow, challenge, or learn from
            others.
          </PageHeaderDescription>
        </PageHeader>
        <Card className="flex min-h-[400px] items-center justify-center">
          <CardContent className="p-6 text-center text-muted-foreground">
            <Users className="mx-auto mb-4 h-12 w-12" />
            <h3 className="text-xl font-semibold">Coming Soon</h3>
            <p>Community features are under construction.</p>
          </CardContent>
        </Card>
      </main>
    </SidebarInset>
  );
}
