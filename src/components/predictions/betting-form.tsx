'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { type Prediction } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const FormSchema = z.object({
  side: z.enum(['YES', 'NO'], {
    required_error: 'You need to select a side.',
  }),
  amount: z.coerce
    .number()
    .min(10, { message: 'Minimum stake is 10 $TRUST.' })
    .max(1000, { message: 'Maximum stake is 1000 $TRUST.' }),
});

interface BettingFormProps {
  prediction: Prediction;
}

export function BettingForm({ prediction }: BettingFormProps) {
  const { toast } = useToast();
  const [selectedSide, setSelectedSide] = useState<'YES' | 'NO' | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: 10,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: 'Bet Placed Successfully!',
      description: `You staked ${data.amount} $TRUST on "${data.side}" for the prediction: "${prediction.question}"`,
    });
    console.log(data);
    form.reset();
    setSelectedSide(null);
  }

  const calculatePotentialWinnings = (
    stake: number,
    side: 'YES' | 'NO'
  ) => {
    if (!stake || stake <= 0) return 0;
    const { yesStake, noStake } = prediction;
    
    const opponentPool = side === 'YES' ? noStake : yesStake;
    const mySidePool = side === 'YES' ? yesStake : noStake;

    if (mySidePool + stake <= 0) return stake;

    const myShare = stake / (mySidePool + stake);
    const potentialReturn = stake + myShare * opponentPool;

    return potentialReturn.toFixed(2);
  };

  const amountValue = form.watch('amount');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="side"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Choose your side</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value: 'YES' | 'NO') => {
                    field.onChange(value);
                    setSelectedSide(value);
                  }}
                  defaultValue={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem
                        value="YES"
                        id="side-yes"
                        className="sr-only"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="side-yes"
                      className={cn(
                        'flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground',
                        field.value === 'YES' && 'border-primary'
                      )}
                    >
                      <span className="text-lg font-bold text-primary">
                        YES
                      </span>
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem
                        value="NO"
                        id="side-no"
                        className="sr-only"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="side-no"
                      className={cn(
                        'flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground',
                        field.value === 'NO' && 'border-destructive'
                      )}
                    >
                      <span className="text-lg font-bold text-destructive">
                        NO
                      </span>
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stake Amount ($TRUST)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 100" {...field} />
              </FormControl>
              <FormDescription>Min: 10, Max: 1,000 $TRUST</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedSide && amountValue > 0 && (
          <div className="space-y-1 rounded-lg border bg-card p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Stake:</span>
              <span className="font-medium">{amountValue} $TRUST</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Potential Return:</span>
              <span className="font-medium text-primary">
                {calculatePotentialWinnings(amountValue, selectedSide)} $TRUST
              </span>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full">
          Place Bet
        </Button>
      </form>
    </Form>
  );
}
