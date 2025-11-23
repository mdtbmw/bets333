import { type Prediction } from '@/lib/data';
import { PredictionCard } from './prediction-card';

interface PredictionListProps {
  predictions: Prediction[];
}

export function PredictionList({ predictions }: PredictionListProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {predictions.map((prediction) => (
        <PredictionCard key={prediction.id} prediction={prediction} />
      ))}
    </div>
  );
}
