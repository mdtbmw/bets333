import { SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import {
  PageHeader,
  PageHeaderTitle,
  PageHeaderDescription,
} from '@/components/shared/page-header';
import { leaderboardUsers } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

export default function LeaderboardPage() {
  return (
    <SidebarInset>
      <AppHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <PageHeader>
          <PageHeaderTitle>Global Leaderboard</PageHeaderTitle>
          <PageHeaderDescription>
            See who is rising to the top. Consistency builds credibility.
          </PageHeaderDescription>
        </PageHeader>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Trust Score</TableHead>
                  <TableHead className="hidden text-right md:table-cell">
                    Record (W/L)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-lg font-medium">
                      {user.rank}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person portrait"/>
                          <AvatarFallback>{user.initials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {user.trustScore.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden text-right md:table-cell">
                      <span className="font-medium">{user.wins}W</span> /{' '}
                      <span className="text-muted-foreground">{user.losses}L</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </SidebarInset>
  );
}
