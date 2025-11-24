
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useWallet } from '@/hooks/use-wallet';
import { blockchainService } from '@/services/blockchain';
import { formatEther, parseEther } from 'viem';
import type { Event, Bet, PnLBet } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border shadow-lg">
        <p className="label font-bold">{`${label}`}</p>
        <p className="intro text-primary">{`PnL : ${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};


export function PnlChart() {
    const { address } = useWallet();
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const calculatePnlHistory = useCallback(async () => {
        if (!address) return;
        setLoading(true);
        
        try {
            const [allEvents, platformFeeBps] = await Promise.all([
                blockchainService.getAllEvents(),
                blockchainService.getPlatformFee()
            ]);

            const eventIds = allEvents.map(e => BigInt(e.id));
            if (eventIds.length === 0) {
                 setChartData([]);
                 setLoading(false);
                 return;
            }
            
            const userBetsOnAllEvents = await blockchainService.getMultipleUserBets(eventIds, address);

            const resolvedBets: PnLBet[] = [];
            
            userBetsOnAllEvents.forEach((onChainBet, index) => {
                const event = allEvents[index];
                if (!event || (onChainBet.yesAmount === 0n && onChainBet.noAmount === 0n) || event.status !== 'finished') {
                    return;
                }

                let pnl = -Number(formatEther(onChainBet.yesAmount + onChainBet.noAmount));
                const userWon = (onChainBet.yesAmount > 0n && event.winningOutcome === 'YES') || (onChainBet.noAmount > 0n && event.winningOutcome === 'NO');

                if(userWon) {
                    const userStake = onChainBet.yesAmount > 0n ? onChainBet.yesAmount : onChainBet.noAmount;
                    const winningPool = event.winningOutcome === 'YES' ? parseEther(String(event.outcomes.yes)) : parseEther(String(event.outcomes.no));
                    
                    if (winningPool > 0n) {
                        const totalPool = parseEther(String(event.totalPool));
                        const fee = (totalPool * BigInt(platformFeeBps)) / 10000n;
                        const distributablePool = totalPool - fee;
                        const payout = (userStake * distributablePool) / winningPool;
                        pnl = Number(formatEther(payout - userStake));
                    }
                }
                
                resolvedBets.push({
                    id: `${event.id}-${address}`,
                    eventId: event.id,
                    eventQuestion: event.question,
                    userBet: onChainBet.yesAmount > 0n ? 'YES' : 'NO',
                    stakedAmount: Number(formatEther(onChainBet.yesAmount + onChainBet.noAmount)),
                    date: event.resolutionDate || new Date(),
                    outcome: userWon ? 'Won' : 'Lost',
                    pnl: pnl
                });
            });

            const sortedBets = resolvedBets.sort((a,b) => a.date.getTime() - b.date.getTime());
            
            let cumulativePnl = 0;
            const pnlByMonth: {[key: string]: number} = {};

            sortedBets.forEach(bet => {
                cumulativePnl += bet.pnl;
                const month = format(bet.date, 'MMM yyyy');
                pnlByMonth[month] = cumulativePnl;
            });
            
            const finalChartData = Object.keys(pnlByMonth).map(month => ({
                name: month,
                pnl: pnlByMonth[month],
            }));
            
            // Ensure we have at least one data point if there are bets, otherwise chart fails
            if (finalChartData.length === 1) {
                const singlePoint = finalChartData[0];
                const pastMonth = new Date(singlePoint.name);
                pastMonth.setMonth(pastMonth.getMonth() - 1);
                finalChartData.unshift({ name: format(pastMonth, 'MMM yyyy'), pnl: 0 });
            }


            setChartData(finalChartData);

        } catch (e) {
            console.error("Failed to calculate PnL History", e);
        } finally {
            setLoading(false);
        }
    }, [address]);

    useEffect(() => {
        calculatePnlHistory();
    }, [calculatePnlHistory]);

  if (loading) {
      return (
          <Card className="glass-panel rounded-[2.5rem] w-full h-full min-h-[400px]">
             <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Calculating your on-chain profit and loss history...</CardDescription>
              </CardHeader>
              <CardContent>
                  <Skeleton className="h-[250px] w-full" />
              </CardContent>
          </Card>
      )
  }
    
  if (chartData.length === 0) {
      return (
           <Card className="glass-panel rounded-[2.5rem] w-full h-full min-h-[400px]">
             <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Your profit and loss over time.</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] w-full flex items-center justify-center text-muted-foreground text-sm font-mono">
                  No historical performance data available.
              </CardContent>
          </Card>
      )
  }

  return (
    <Card className="glass-panel rounded-[2.5rem] w-full h-full">
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>Your cumulative profit and loss over time.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10, right: 30, left: 0, bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value.toFixed(0)}`} />
            <Tooltip
              content={<CustomTooltip />}
            />
            <Area type="monotone" dataKey="pnl" stroke="hsl(var(--primary))" fill="url(#colorPnl)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
