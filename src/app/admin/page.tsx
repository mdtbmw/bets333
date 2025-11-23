import { SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import {
  PageHeader,
  PageHeaderTitle,
  PageHeaderDescription,
} from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  return (
    <SidebarInset>
      <AppHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <PageHeader>
          <PageHeaderTitle>Admin Realm</PageHeaderTitle>
          <PageHeaderDescription>
            Manage prediction events, user accounts, and platform
            configurations.
          </PageHeaderDescription>
        </PageHeader>
        <Card className="flex min-h-[400px] items-center justify-center">
          <CardContent className="p-6 text-center text-muted-foreground">
            <Shield className="mx-auto mb-4 h-12 w-12" />
            <h3 className="text-xl font-semibold">Coming Soon</h3>
            <p>The Admin Realm is currently being fortified.</p>
          </CardContent>
        </Card>
      </main>
    </SidebarInset>
  );
}
