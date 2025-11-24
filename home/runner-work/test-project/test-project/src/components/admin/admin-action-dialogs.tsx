'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event, BetOutcome } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Lock, Ban, CircleDotDashed, Trash2, Edit, ChevronDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/use-wallet";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { blockchainService } from "@/services/blockchain";
import { useNotifications } from '@/lib/state/notifications';
import { WalletClient, Address } from "viem";

// Merged Dialog Components

interface DialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    event: Event;
    onActionSuccess: () => void;
}

interface DeclareDialogProps extends DialogProps {
    walletClient: WalletClient | null | undefined;
    address: Address | undefined;
}

export function DeclareOutcomeDialog({ isOpen, setIsOpen, event, onActionSuccess, walletClient, address }: DeclareDialogProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [outcome, setOutcome] = useState<BetOutcome | null>(null);
    const { addNotification } = useNotifications();

    const handleDeclare = async () => {
        if (!outcome) {
            toast({ variant: 'destructive', title: 'Please select an outcome.'});
            return;
        }
        if (!walletClient || !address) {
            toast({ variant: 'destructive', title: 'Wallet not connected.'});
            return;
        }
        setIsLoading(true);
        try {
            const txHash = await blockchainService.resolveEvent(walletClient, address, BigInt(event.id), outcome === 'YES');
            addNotification({
                title: "Transaction Submitted",
                description: `Declaring outcome... Tx: ${txHash.slice(0, 10)}...`,
                icon: 'Loader2',
                type: 'onEventResolved'
            });
            await blockchainService.waitForTransaction(txHash);
            addNotification({
                title: 'Outcome Declared!',
                description: `Event "${event.question.slice(0, 20)}..." has been resolved.`,
                icon: 'CheckCircle',
                type: 'onEventResolved'
            });
            onActionSuccess();
            setIsOpen(false);
        } catch(e: any) {
            console.error(e);
            addNotification({
                variant: 'destructive',
                title: 'Failed to Declare Outcome',
                description: e.message || 'An unexpected error occurred.',
                icon: 'AlertTriangle',
                type: 'general'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Declare Winning Outcome</AlertDialogTitle>
                    <AlertDialogDescription>
                        Select the final, verified outcome for the event: "{event.question}". This action is irreversible and will allow winners to claim their funds.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-4">
                     <Select onValueChange={(value: BetOutcome) => setOutcome(value)} disabled={event.status !== 'open' && event.status !== 'closed'}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select the winning outcome..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="YES">YES</SelectItem>
                            <SelectItem value="NO">NO</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeclare} disabled={isLoading || !outcome || (event.status !== 'open' && event.status !== 'closed')}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? 'Submitting...' : 'Declare Outcome'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export function CancelEventDialog({ isOpen, setIsOpen, event, onActionSuccess }: DialogProps) {
    const { toast } = useToast();
    const { walletClient, address } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotifications();


    const handleCancel = async () => {
         if (!walletClient || !address) {
            toast({ variant: 'destructive', title: 'Wallet not connected.'});
            return;
        }
        setIsLoading(true);
        try {
            const txHash = await blockchainService.cancelEvent(walletClient, address, BigInt(event.id));
             addNotification({
                title: "Transaction Submitted",
                description: `Canceling event... Tx: ${txHash.slice(0, 10)}...`,
                icon: 'Loader2',
                type: 'general'
            });
            await blockchainService.waitForTransaction(txHash);
            addNotification({
                title: 'Event Canceled',
                description: `Event "${event.question.slice(0, 20)}..." has been canceled. All stakes have been refunded.`,
                icon: 'Ban',
                variant: 'destructive',
                type: 'general'
            });
            onActionSuccess();
            setIsOpen(false);
        } catch(e: any) {
            console.error(e);
             addNotification({
                variant: 'destructive',
                title: 'Failed to Cancel Event',
                description: e.message || 'An unexpected error occurred.',
                icon: 'AlertTriangle',
                type: 'general'
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete and Refund Event?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You are about to delete the event: "{event.question}". This will permanently cancel the event and allow all participants to claim a full refund of their stake. This action is irreversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Back</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleCancel} disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? 'Canceling...' : 'Yes, Delete & Refund'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}


// Original Table Component

const ITEMS_PER_PAGE = 10;

const getStatusBadge = (status: Event['status']) => {
  switch (status) {
    case "open":
      return <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5"><CircleDotDashed className="w-3 h-3 animate-pulse"/>Live</Badge>;
    case "closed":
      return <Badge variant="secondary" className="gap-1.5"><Lock className="w-3 h-3"/>Locked</Badge>;
    case "finished":
      return <Badge variant="secondary" className="opacity-70 gap-1.5"><CheckCircle className="w-3 h-3"/>Resolved</Badge>;
    case "canceled":
      return <Badge variant="destructive" className="gap-1.5"><Ban className="w-3 h-3"/>Canceled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const EventCard = ({ event, onDeclare, onCancel }: { event: Event; onDeclare: (e: Event) => void; onCancel: (e: Event) => void; }) => {
    const router = useRouter();
    const { chain } = useWallet();

    return (
        <Card className="glass-panel" onClick={() => router.push(`/event/${event.id}`)}>
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <p className="font-semibold text-foreground pr-4">{event.question}</p>
                    {getStatusBadge(event.status)}
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Pool</p>
                    <p className="font-bold text-foreground">{event.totalPool.toFixed(4)} {chain?.nativeCurrency.symbol}</p>
                </div>
                 <div className="text-right">
                    <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Betting Locks</p>
                    <p className="font-bold text-foreground">{event.bettingStopDate ? format(new Date(event.bettingStopDate), "PP") : 'N/A'}</p>
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                 <Button
                    size="sm"
                    variant="secondary"
                    className="w-full active-press"
                    onClick={(e) => { e.stopPropagation(); onDeclare(event); }}
                    disabled={event.status === 'finished' || event.status === 'canceled'}
                    >
                        <Edit className="w-4 h-4 mr-2"/>
                        Declare Result
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                     className="w-full active-press"
                    onClick={(e) => { e.stopPropagation(); onCancel(event); }}
                    disabled={event.status !== 'open'}
                    >
                        <Trash2 className="w-4 h-4 mr-2"/>
                        Refund
                </Button>
            </CardFooter>
        </Card>
    );
};

interface AdminEventTableProps {
  events: Event[] | null;
  loading: boolean;
  onActionSuccess: () => void;
}

export function AdminEventTable({ events, loading, onActionSuccess }: AdminEventTableProps) {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isDeclareOpen, setDeclareOpen] = useState(false);
    const [isCancelOpen, setCancelOpen] = useState(false);
    const router = useRouter();
    const { chain, walletClient, address } = useWallet();
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    const handleDeclare = (event: Event) => {
        setSelectedEvent(event);
        setDeclareOpen(true);
    };

    const handleCancel = (event: Event) => {
        setSelectedEvent(event);
        setCancelOpen(true);
    };

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    };
    
    const visibleEvents = useMemo(() => events?.slice(0, visibleCount) || [], [events, visibleCount]);
    const canLoadMore = events ? visibleCount < events.length : false;


  if (loading) {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
        </div>
    )
  }

  return (
    <>
    {/* Mobile Card View */}
    <div className="grid md:hidden grid-cols-1 gap-4">
        {visibleEvents && visibleEvents.length > 0 ? (
            visibleEvents.map((event) => (
                <EventCard key={event.id} event={event} onDeclare={handleDeclare} onCancel={handleCancel} />
            ))
        ) : (
             <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl">
                No events found.
            </div>
        )}
        {canLoadMore && (
            <Button onClick={handleLoadMore} variant="outline" className="w-full active-press">
                <ChevronDown className="w-4 h-4 mr-2" />
                Load More
            </Button>
        )}
    </div>


    {/* Desktop Table View */}
    <div className="hidden md:block glass-panel rounded-[2rem]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[45%]">Event</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pool</TableHead>
            <TableHead>Betting Locks</TableHead>
            <TableHead className="text-right w-[300px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleEvents && visibleEvents.length > 0 ? (
            visibleEvents.map((event) => (
              <TableRow key={event.id} onClick={() => router.push(`/event/${event.id}`)} className="cursor-pointer group">
                <TableCell className="font-medium max-w-sm truncate text-foreground group-hover:text-primary transition-colors">
                  <div className="flex items-center">
                    <span>{event.question}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(event.status)}</TableCell>
                <TableCell>{event.totalPool.toFixed(4)} {chain?.nativeCurrency.symbol}</TableCell>
                <TableCell>{event.bettingStopDate ? format(new Date(event.bettingStopDate), "PPp") : 'N/A'}</TableCell>
                <TableCell className="text-right">
                   <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="active-press"
                        onClick={(e) => { e.stopPropagation(); handleDeclare(event); }}
                        disabled={event.status === 'finished' || event.status === 'canceled'}
                        >
                         Declare Result
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="active-press"
                        onClick={(e) => { e.stopPropagation(); handleCancel(event); }}
                        disabled={event.status !== 'open'}
                        >
                         <Trash2 className="w-4 h-4 mr-2"/>
                         Delete/Refund
                      </Button>
                   </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No events found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
       {canLoadMore && (
        <div className="p-4 border-t">
            <Button onClick={handleLoadMore} variant="outline" className="w-full active-press">
                <ChevronDown className="w-4 h-4 mr-2" />
                Load More
            </Button>
        </div>
        )}
      </div>
      {selectedEvent && (
        <>
            <DeclareOutcomeDialog
                isOpen={isDeclareOpen}
                setIsOpen={setDeclareOpen}
                event={selectedEvent}
                onActionSuccess={onActionSuccess}
                walletClient={walletClient}
                address={address}
            />
            <CancelEventDialog
                isOpen={isCancelOpen}
                setIsOpen={setCancelOpen}
                event={selectedEvent}
                onActionSuccess={onActionSuccess}
            />
        </>
      )}
    </>
  );
}