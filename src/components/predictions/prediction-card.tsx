'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type Prediction } from '@/lib/data';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Users, Clock, Flame } from 'lucide-react';
import { TrendingInsight } from './trending-insight';
import { Countdown } from './countdown';
import { cn } from '@/lib/utils';

interface PredictionCardProps {
  prediction: Prediction;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const totalStake = prediction.yesStake + prediction.noStake;
  const yesPercentage =
    totalStake > 0 ? (prediction.yesStake / totalStake) * 100 : 50;

  const isFinished = prediction.status === 'finished';

  const getResultBadgeVariant = () => {
    if (isFinished) {
      return prediction.result === 'YES' ? 'default' : 'destructive';
    }
    return 'outline';
  };

  const getResultBadgeText = () => {
    if (isFinished) {
      return `Result: ${prediction.result}`;
    }
    return 'In Progress';
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={prediction.image.url}
            alt={prediction.question}
            fill
            className="object-cover"
            data-ai-hint={prediction.image.hint}
          />
          <div className="absolute right-2 top-2 flex gap-2">
            {prediction.isTrending && (
              <Badge variant="destructive" className="items-center gap-1">
                <Flame className="h-3 w-3" /> Trending
              </Badge>
            )}
            <Badge variant="secondary">{prediction.category}</Badge>
          </div>
        </div>
        <div className="p-6 pb-2">
          <CardTitle className="leading-snug text-lg">
            {prediction.question}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-sm font-medium">
            <span className="text-primary">YES</span>
            <span className="text-destructive">NO</span>
          </div>
          <Progress value={yesPercentage} />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{prediction.yesStake.toLocaleString()} $TRUST</span>
            <span>{prediction.noStake.toLocaleString()} $TRUST</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{prediction.participants.toLocaleString()} participants</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {isFinished ? <span>Ended</span> : <Countdown deadline={prediction.deadline} />}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3">
        <div className="flex items-center justify-between">
          <Badge variant={getResultBadgeVariant()}>{getResultBadgeText()}</Badge>
          {prediction.isTrending && <TrendingInsight prediction={prediction} />}
        </div>
        <Button asChild className="w-full" disabled={isFinished}>
          <Link href={`/predictions/${prediction.id}`}>
            {isFinished ? 'View Result' : 'Place Bet'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
