import { notFound } from 'next/navigation';
import Image from 'next/image';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { predictions, type Prediction } from '@/lib/data';
import {
  PageHeaderDescription,
} from '@/components/shared/page-header';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Clock, Flame, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BettingForm } from '@/components/predictions/betting-form';
import { Countdown } from '@/components/predictions/countdown';

async function getPrediction(id: string): Promise<Prediction | undefined> {
  return predictions.find((p) => p.id === id);
}

export default async function PredictionDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const prediction = await getPrediction(params.id);

  if (!prediction) {
    notFound();
  }

  const totalStake = prediction.yesStake + prediction.noStake;
  const yesPercentage =
    totalStake > 0 ? (prediction.yesStake / totalStake) * 100 : 50;
  const isFinished = prediction.status === 'finished';

  return (
    <SidebarInset>
      <AppHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-4">
          <Button asChild variant="outline">
            <Link href="/" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Marketplace
            </Link>
          </Button>
        </div>
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative h-64 w-full">
                  <Image
                    src={prediction.image.url}
                    alt={prediction.question}
                    fill
                    className="object-cover"
                    data-ai-hint={prediction.image.hint}
                  />
                  <div className="absolute right-2 top-2 flex gap-2">
                    {prediction.isTrending && (
                      <Badge
                        variant="destructive"
                        className="items-center gap-1"
                      >
                        <Flame className="h-3 w-3" /> Trending
                      </Badge>
                    )}
                    <Badge variant="secondary">{prediction.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <h1 className="font-headline mb-4 text-2xl font-bold">
                  {prediction.question}
                </h1>
                <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {prediction.participants.toLocaleString()} participants
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {isFinished ? (
                      <span>Ended</span>
                    ) : (
                      <Countdown deadline={prediction.deadline} />
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {prediction.recentNews}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            {isFinished ? (
              <Card className="flex h-full flex-col items-center justify-center bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-center">
                    Prediction Concluded
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="mb-4 text-muted-foreground">
                    The final result is:
                  </p>
                  <Badge
                    className={`px-6 py-2 text-2xl ${
                      prediction.result === 'YES'
                        ? 'bg-primary'
                        : 'bg-destructive'
                    }`}
                  >
                    {prediction.result}
                  </Badge>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Place Your Bet</CardTitle>
                  <PageHeaderDescription>
                    Choose a side and stake your $TRUST tokens.
                  </PageHeaderDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="mb-1 flex justify-between text-sm font-medium">
                      <span className="text-primary">YES Pool</span>
                      <span className="text-destructive">NO Pool</span>
                    </div>
                    <Progress value={yesPercentage} />
                    <div className="mt-1 flex justify-between text-sm font-bold">
                      <span>
                        {prediction.yesStake.toLocaleString()} $TRUST
                      </span>
                      <span>
                        {prediction.noStake.toLocaleString()} $TRUST
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <BettingForm prediction={prediction} />
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </main>
    </SidebarInset>
  );
}
