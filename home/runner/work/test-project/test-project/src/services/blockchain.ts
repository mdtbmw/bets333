
'use client';

import { createPublicClient, http, formatEther, parseEther, Hex, Address, Hash, WalletClient, PublicClient, getAddress, UserRejectedRequestError, TransactionReceipt, decodeEventLog } from 'viem';
import type { Event, BetOutcome, EventStatus, NotificationType, UserProfile } from '@/lib/types';
import { IntuitionBettingAbi } from '@/lib/IntuitionBettingAbi';
import { UserProfileRegistryAbi } from '@/lib/UserProfileRegistryAbi';
import { activeChain } from '@/lib/chains';
import placeholderData from '@/lib/placeholder-images.json';

// This is a global function to be initialized by a top-level component
let notify: (notification: Omit<NotificationType, 'id' | 'timestamp' | 'read'>) => void;
export const initializeBlockchainServiceNotifier = (addNotification: (notification: Omit<NotificationType, 'id' | 'timestamp' | 'read'>) => void) => {
    notify = addNotification;
}

const bettingAddressRaw = process.env.NEXT_PUBLIC_INTUITION_BETTING_ADDRESS;
const profileAddressRaw = process.env.NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS;

const DESCRIPTION_IMAGE_DELIMITER = '|||';

// Simple in-memory cache
let eventsCache: Event[] | null = null;
let lastCacheTime: number | null = null;
const CACHE_DURATION_MS = 30000; // 30 seconds

type BetPlacedLog = { eventId: bigint; user: Address; outcome: boolean; amount: bigint; } & { blockNumber: bigint; };
type WinningsClaimedLog = { eventId: bigint; user: Address; amount: bigint; } & { blockNumber: bigint; };
type EventCanceledLog = { eventId: bigint } & { blockNumber: bigint; };

interface AllLogs {
    betPlaced: BetPlacedLog[];
    winningsClaimed: WinningsClaimedLog[];
    eventCanceled: EventCanceledLog[];
}


class IntuitionService {
  public publicClient: PublicClient;
  private bettingContractAddress: Address | null = null;
  private profileContractAddress: Address | null = null;

  constructor() {
    this.publicClient = createPublicClient({
      chain: activeChain,
      transport: http(),
      batch: { multicall: false } 
    });

    if (bettingAddressRaw) {
        try {
            this.bettingContractAddress = getAddress(bettingAddressRaw);
        } catch {
             console.warn(`WARN: The provided NEXT_PUBLIC_INTUITION_BETTING_ADDRESS "${bettingAddressRaw}" is not a valid Ethereum address. Using placeholder.`);
             this.bettingContractAddress = '0x0000000000000000000000000000000000000000';
        }
    }

    if (profileAddressRaw) {
        try {
            this.profileContractAddress = getAddress(profileAddressRaw);
        } catch {
             console.warn(`WARN: The provided NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS "${profileAddressRaw}" is not a valid Ethereum address. Using placeholder.`);
             this.profileContractAddress = '0x0000000000000000000000000000000000000000';
        }
    }
  }

  private getBettingContractAddress(): Address {
    if (!this.bettingContractAddress || this.bettingContractAddress === '0x0000000000000000000000000000000000000000') {
        console.warn("Warning: NEXT_PUBLIC_INTUITION_BETTING_ADDRESS is not configured. Event-related features will be disabled until a valid address is provided after deployment.");
        return '0x0000000000000000000000000000000000000000';
    }
    return this.bettingContractAddress;
  }

  private getProfileContractAddress(): Address {
    if (!this.profileContractAddress || this.profileContractAddress === '0x0000000000000000000000000000000000000000') {
        console.warn("Warning: NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS is not configured. Profile features will be disabled until a valid address is provided after deployment.");
        return '0x0000000000000000000000000000000000000000';
    }
    return this.profileContractAddress;
  }


  public clearCache() {
    eventsCache = null;
    lastCacheTime = null;
  }
  
  private parseDescriptionAndImage(fullDescription: string): { description: string, imageUrl?: string } {
    if (fullDescription.includes(DESCRIPTION_IMAGE_DELIMITER)) {
      const parts = fullDescription.split(DESCRIPTION_IMAGE_DELIMITER);
      return {
        description: parts[0],
        imageUrl: parts[1]
      };
    }
    return { description: fullDescription };
  }


  private normalizeOnChainEvent(eventData: any, id: bigint): Event {
    const totalPool = Number(formatEther(eventData.yesPool)) + Number(formatEther(eventData.noPool));
    
    let status: EventStatus;
    switch(eventData.status) {
        case 0: status = 'open'; break;
        case 1: status = 'closed'; break;
        case 2: status = 'finished'; break;
        case 3: status = 'canceled'; break;
        default: status = 'open';
    }
    
    const bettingStopDate = eventData.bettingStopDate > 0 ? new Date(Number(eventData.bettingStopDate) * 1000) : null;
    const resolutionDate = eventData.resolutionDate > 0 ? new Date(Number(eventData.resolutionDate) * 1000) : null;
    
    // If betting has ended but not resolved, status should be 'closed'
    if (status === 'open' && bettingStopDate && bettingStopDate < new Date()) {
      status = 'closed';
    }


    let winningOutcome: BetOutcome | undefined = undefined;
    if(eventData.winningOutcome === 1) winningOutcome = 'YES';
    else if (eventData.winningOutcome === 2) winningOutcome = 'NO';
    
    const { description, imageUrl: parsedImageUrl } = this.parseDescriptionAndImage(eventData.description || '');
    
    return {
      id: String(id),
      question: eventData.question,
      description,
      imageUrl: eventData.imageUrl || parsedImageUrl,
      category: eventData.category,
      bettingStopDate: bettingStopDate,
      resolutionDate: resolutionDate,
      minStake: Number(formatEther(eventData.minStake)),
      maxStake: Number(formatEther(eventData.maxStake)),
      status: status,
      outcomes: {
        yes: Number(formatEther(eventData.yesPool)),
        no: Number(formatEther(eventData.noPool)),
      },
      totalPool: totalPool,
      participants: [], // This would require a separate indexing service to track efficiently
      winningOutcome: winningOutcome,
    };
  }

  private handleContractError(err: any, context: string): never {
      console.error(`Error in ${context}:`, err);
      // Attempt to find a more specific reason
      const reason = (err.cause as any)?.reason || err.shortMessage || 'An unknown contract error occurred.';
      
      throw new Error(`A contract error occurred: ${reason}. Please check the console for details.`);
  }

  async getPlatformFee(): Promise<number> {
    const address = this.getBettingContractAddress();
     if (address === '0x0000000000000000000000000000000000000000') return 300; // Return default if contract not set

    try {
        const feeBps = await this.publicClient.readContract({
            address: address,
            abi: IntuitionBettingAbi,
            functionName: 'platformFeeBps',
        });
        return Number(feeBps);
    } catch (e) {
        console.error("Failed to fetch platform fee", e);
        return 300; // Default to 3% if fetch fails
    }
  }

  async getAllEvents(): Promise<Event[]> {
     const now = Date.now();
     if (eventsCache && lastCacheTime && (now - lastCacheTime < CACHE_DURATION_MS)) {
        return eventsCache;
     }

    try {
        const address = this.getBettingContractAddress();
       if (address === '0x0000000000000000000000000000000000000000') {
           return []; // Return empty array if contract not set
       }

        const nextId = await this.publicClient.readContract({
            address: address,
            abi: IntuitionBettingAbi,
            functionName: 'nextEventId',
        });
        
        if (!nextId || nextId === 0n) {
            eventsCache = [];
            lastCacheTime = now;
            return [];
        }

        const eventIds = Array.from({ length: Number(nextId) }, (_, i) => BigInt(i));
        
        if (eventIds.length === 0) {
          eventsCache = [];
          lastCacheTime = now;
          return [];
        }

        const eventPromises = eventIds.map(id => 
          this.publicClient.readContract({
            address: address,
            abi: IntuitionBettingAbi,
            functionName: 'getEvent',
            args: [id],
          }).catch(err => {
            console.error(`Failed to fetch event ${id}:`, err);
            return null; // Return null on failure for this specific call
          })
        );
      
      const onchainResults = await Promise.all(eventPromises);

      const events = onchainResults
        .map((res, index) => {
          if (res) {
            return this.normalizeOnChainEvent(res, eventIds[index]);
          }
          return null;
        })
        .filter((e): e is Event => e !== null && e.id !== "0" && e.question !== '');

      const sortedEvents = events.sort((a, b) => (b.bettingStopDate?.getTime() || 0) - (a.bettingStopDate?.getTime() || 0));
      
      eventsCache = sortedEvents;
      lastCacheTime = now;

      return sortedEvents;

    } catch (err: any) {
       console.error('Core `getAllEvents` call failed. This could be due to an RPC issue or invalid contract address.', err.message);
       throw new Error("Failed to fetch event data from the blockchain. The network may be congested or the service unavailable.");
    }
  }

  async getEventById(eventId: string): Promise<Event | null> {
    const address = this.getBettingContractAddress();
    if (address === '0x0000000000000000000000000000000000000000') return null;

    if (eventsCache) {
      const cachedEvent = eventsCache.find(e => e.id === eventId);
      if (cachedEvent) return cachedEvent;
    }

    try {
      const eventData = await this.publicClient.readContract({
        address: address,
        abi: IntuitionBettingAbi,
        functionName: 'getEvent',
        args: [BigInt(eventId)],
      });
      
      const participants: Address[] = []; 

      const normalized = this.normalizeOnChainEvent(eventData, BigInt(eventId));
      normalized.participants = participants;
      return normalized;

    } catch (err) {
      return null;
    }
  }
  
  async getMultipleUserBets(eventIds: bigint[], userAddress: Address): Promise<{yesAmount: bigint, noAmount: bigint, claimed: boolean}[]> {
    const address = this.getBettingContractAddress();
     if (address === '0x0000000000000000000000000000000000000000') return [];

    try {
        const betPromises = eventIds.map(id => 
            this.publicClient.readContract({
                address: address,
                abi: IntuitionBettingAbi,
                functionName: 'getUserBet',
                args: [id, userAddress],
            }).catch(err => {
                console.error(`Failed to fetch user bet for event ${id}:`, err);
                return { yesAmount: 0n, noAmount: 0n, claimed: false }; // Return default on failure
            })
        );
        const results = await Promise.all(betPromises);
        return results;
    } catch(e) {
        console.error("Batch fetch for user bets failed", e);
        // Return an array of default values matching the input length
        return eventIds.map(() => ({ yesAmount: 0n, noAmount: 0n, claimed: false }));
    }
  }

    async getAllLogs(userAddress?: Address): Promise<AllLogs> {
        const address = this.getBettingContractAddress();
        if (address === '0x0000000000000000000000000000000000000000') return { betPlaced: [], winningsClaimed: [], eventCanceled: [] };

        try {
            const fromBlock = 0n;

            const rawLogs = await this.publicClient.getLogs({
                address,
                fromBlock,
                toBlock: 'latest',
            });

            const betPlaced: BetPlacedLog[] = [];
            const winningsClaimed: WinningsClaimedLog[] = [];
            const eventCanceled: EventCanceledLog[] = [];

            for (const log of rawLogs) {
                try {
                    const decodedLog = decodeEventLog({
                        abi: IntuitionBettingAbi,
                        data: log.data,
                        topics: log.topics,
                    });

                    if (userAddress && 'user' in decodedLog.args && decodedLog.args.user !== userAddress) {
                        continue;
                    }

                    if (decodedLog.eventName === 'BetPlaced' && decodedLog.args) {
                        betPlaced.push({
                            ...(decodedLog.args as { eventId: bigint; user: Address; outcome: boolean; amount: bigint; }),
                            blockNumber: log.blockNumber,
                        });
                    } else if (decodedLog.eventName === 'WinningsClaimed' && decodedLog.args) {
                        winningsClaimed.push({
                             ...(decodedLog.args as { eventId: bigint; user: Address; amount: bigint; }),
                            blockNumber: log.blockNumber,
                        });
                    } else if (decodedLog.eventName === 'EventCanceled' && decodedLog.args) {
                        eventCanceled.push({
                            ...(decodedLog.args as { eventId: bigint; }),
                            blockNumber: log.blockNumber,
                        });
                    }
                } catch (e) {
                    // Ignore logs that don't match our ABI
                }
            }

            return {
                betPlaced,
                winningsClaimed,
                eventCanceled,
            };

        } catch (e) {
            console.error("Failed to fetch logs:", e);
            return { betPlaced: [], winningsClaimed: [], eventCanceled: [] };
        }
    }
  
  async createEvent(
    walletClient: WalletClient, 
    account: Address, 
    question: string,
    description: string,
    category: string,
    bettingStopDate: Date,
    resolutionDate: Date,
    minStake: number, 
    maxStake: number,
    imageUrl?: string
): Promise<{txHash: Hash, eventId: string}> {
    const address = this.getBettingContractAddress();
    if (!walletClient.account) throw new Error('Wallet client is not connected.');
    
    notify({
        title: 'Transaction Submitted',
        description: `Creating event... please wait for confirmation.`,
        icon: 'Loader2',
        type: 'general' 
    });

    try {
        const fullDescription = description;
        
        const finalImageUrl = imageUrl || placeholderData.categories.find(c => c.name === category)?.image || '';

        const bettingTimestamp = BigInt(Math.floor(bettingStopDate.getTime() / 1000));
        const resolutionTimestamp = BigInt(Math.floor(resolutionDate.getTime() / 1000));

        const minStakeWei = parseEther(String(minStake));
        const maxStakeWei = parseEther(String(maxStake));

        const { request } = await this.publicClient.simulateContract({
            account,
            address: address,
            abi: IntuitionBettingAbi,
            functionName: 'createEvent',
            args: [question, fullDescription, category, finalImageUrl, bettingTimestamp, resolutionTimestamp, minStakeWei, maxStakeWei],
        });
        const txHash = await walletClient.writeContract(request);
        const receipt = await this.waitForTransaction(txHash);

        const eventLog = receipt.logs.find(log => {
          try {
            const decoded = decodeEventLog({ abi: IntuitionBettingAbi, data: log.data, topics: log.topics });
            return decoded.eventName === 'EventCreated';
          } catch {
            return false;
          }
        });

        if (!eventLog) throw new Error('Could not find EventCreated log in transaction receipt');

        const decodedLog = decodeEventLog({ abi: IntuitionBettingAbi, data: eventLog.data, topics: eventLog.topics });
        const eventId = (decodedLog.args as any)?.id?.toString();

        if (!eventId) throw new Error('Could not determine eventId from transaction receipt');
      
        this.clearCache();

        notify({
            title: 'Event Created Successfully!',
            description: `The event is now live. Click to view.`,
            icon: 'CheckCircle',
            variant: 'success',
            href: `/event/${eventId}`,
            type: 'general'
        });

        return { txHash, eventId };

    } catch (err) {
        this.handleContractError(err, 'create event');
    }
  }

  async placeBet(walletClient: WalletClient, account: Address, eventId: bigint, outcome: boolean, amountString: string): Promise<Hash> {
    const address = this.getBettingContractAddress();
    if (!walletClient.account) throw new Error('Wallet client is not connected.');
    
    try {
        const amount = parseEther(amountString);
        
        const { request } = await this.publicClient.simulateContract({
        account: walletClient.account,
        address: address,
        abi: IntuitionBettingAbi,
        functionName: 'placeBet',
        args: [eventId, outcome],
        value: amount
        });
        return walletClient.writeContract(request);
    } catch (err) {
        this.handleContractError(err, 'place bet');
    }
  }

  async resolveEvent(walletClient: WalletClient, account: Address, eventId: bigint, outcome: boolean): Promise<Hash> {
     const address = this.getBettingContractAddress();
     if (!walletClient.account) throw new Error('Wallet client is not connected.');
     
     try {
        const { request } = await this.publicClient.simulateContract({
            account: walletClient.account,
            address: address,
            abi: IntuitionBettingAbi,
            functionName: 'resolveEvent',
            args: [eventId, outcome],
        });
        return walletClient.writeContract(request);
    } catch (err) {
        this.handleContractError(err, 'declare result');
    }
  }

  async cancelEvent(walletClient: WalletClient, account: Address, eventId: bigint): Promise<Hash> {
    const address = this.getBettingContractAddress();
    if (!walletClient.account) throw new Error('Wallet client is not connected.');
    try {
        const { request } = await this.publicClient.simulateContract({
            account: walletClient.account,
            address: address,
            abi: IntuitionBettingAbi,
            functionName: 'cancelEvent',
            args: [eventId],
        });
        return walletClient.writeContract(request);
    } catch (err) {
        this.handleContractError(err, 'cancel event');
    }
  }

  async claim(walletClient: WalletClient, account: Address, eventId: bigint): Promise<Hash> {
    const address = this.getBettingContractAddress();
    if (!walletClient.account) throw new Error('Wallet client is not connected or account is not available.');

    try {
        const { request } = await this.publicClient.simulateContract({
            account: walletClient.account,
            address: address,
            abi: IntuitionBettingAbi,
            functionName: 'claim',
            args: [eventId],
        });
        return walletClient.writeContract(request);
    } catch (err) {
        this.handleContractError(err, 'claim winnings');
    }
  }

  // --- User Profile Registry Functions ---

  async getProfile(userAddress: Address): Promise<UserProfile> {
    const address = this.getProfileContractAddress();
    if (address === '0x0000000000000000000000000000000000000000') return { username: '', bio: '', twitter: '', website: '' };

    try {
        const profileData = await this.publicClient.readContract({
            address,
            abi: UserProfileRegistryAbi,
            functionName: 'getProfile',
            args: [userAddress],
        });

        return {
            username: profileData.username,
            bio: profileData.bio,
            twitter: profileData.twitterHandle,
            website: profileData.websiteUrl,
        };
    } catch (e) {
        // If profile doesn't exist or contract fails, return a default profile
        console.warn(`Could not fetch profile for ${userAddress}. It might not exist.`, e);
        return { username: '', bio: '', twitter: '', website: '' };
    }
  }

  async setProfile(
    walletClient: WalletClient,
    account: Address,
    profile: UserProfile
  ): Promise<Hash> {
    const address = this.getProfileContractAddress();
    if (!walletClient.account) throw new Error('Wallet client is not connected.');

    try {
        const { request } = await this.publicClient.simulateContract({
            account,
            address,
            abi: UserProfileRegistryAbi,
            functionName: 'setProfile',
            args: [profile.username, profile.bio, profile.twitter, profile.website],
        });

        return walletClient.writeContract(request);
    } catch (err) {
        this.handleContractError(err, 'set profile');
    }
  }


  async waitForTransaction(hash: Hash): Promise<TransactionReceipt> {
    return this.publicClient.waitForTransactionReceipt({ hash });
  }
}

export const blockchainService = new IntuitionService();
