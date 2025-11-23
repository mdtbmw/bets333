'use client';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Lightbulb, Loader2 } from 'lucide-react';
import { type Prediction } from '@/lib/data';
import { getTrendingPredictionInsights } from '@/lib/actions';

interface TrendingInsightProps {
  prediction: Prediction;
}

export function TrendingInsight({ prediction }: TrendingInsightProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFetchInsight = () => {
    // Only fetch if we don't have an insight yet
    if (insight) return;

    startTransition(async () => {
      setError(null);
      const result = await getTrendingPredictionInsights({
        predictionQuestion: prediction.question,
        yesStake: prediction.yesStake,
        noStake: prediction.noStake,
        recentNews: prediction.recentNews,
      });

      if (result.success) {
        setInsight(result.insight);
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
    });
  };

  return (
    <Popover onOpenChange={handleFetchInsight}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <span className="sr-only">Get AI Insight</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">AI Insight</h4>
            <p className="text-sm text-muted-foreground">
              Why is this prediction trending?
            </p>
          </div>
          <div className="min-h-[60px]">
            {isPending ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <p className="text-sm">{insight}</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
