
'use client';

import { GreetingCard } from '@/components/dashboard/greeting-card';
import { CategoryCarousel } from '@/components/dashboard/category-carousel';
import { EventList } from '@/components/event-list';
import { EventFilterTabs } from '@/components/dashboard/event-filter-tabs';
import { DashboardSearch } from '@/components/dashboard/dashboard-search';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { EventStatus } from '@/lib/types';


export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get('category') || 'All';
  const initialSearchTerm = searchParams.get('q') || '';
  const initialFilter = searchParams.get('filter') || 'live';

  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  useEffect(() => {
    // This effect can cause issues during server-side rendering or hydration if window is accessed.
    // It's better to run it only on the client after mount.
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (categoryFilter !== 'All') {
        params.set('category', categoryFilter);
      } else {
        params.delete('category');
      }
      if (searchTerm) {
        params.set('q', searchTerm);
      } else {
        params.delete('q');
      }
      if (activeFilter) {
        params.set('filter', activeFilter);
      } else {
        params.delete('filter');
      }
      router.replace(`/?${params.toString()}`, { scroll: false });
    }
  }, [categoryFilter, searchTerm, activeFilter, router]);
  
  const getEventListProps = () => {
    switch (activeFilter) {
      case 'upcoming':
        return { isUpcoming: true };
      case 'closed':
        return { status: ['finished', 'canceled'] as EventStatus[] };
      case 'live':
      default:
        return { status: 'open' as EventStatus };
    }
  };


  return (
    <div className="space-y-8">
      <GreetingCard />
      <CategoryCarousel categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} />
      <DashboardSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <EventFilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <EventList 
          category={categoryFilter}
          searchTerm={searchTerm}
          {...getEventListProps()}
        />
      </div>
    </div>
  );
}
