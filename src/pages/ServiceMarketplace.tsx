import { useEffect, useState } from 'react';
import { Search, ArrowRight, Clock } from 'lucide-react';
import { fetchServices } from '@/lib/db';
import type { Service } from '@/lib/types';
import { getIcon } from '@/components/ui/Badges';
import { Card, EmptyState, Skeleton } from '@/components/ui';

export function ServiceMarketplace({ onOpenService }: { onOpenService: (id: string) => void }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...Array.from(new Set(services.map((s) => s.category)))];
  const filtered = services.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || s.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Government Service Marketplace</h1>
        <p className="text-slate-500 mt-1">Browse and apply for government services with automatic data retrieval.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-gov-700 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Search}
            title="No services found"
            description="Try adjusting your search or filter to find what you're looking for."
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => {
            const Icon = getIcon(service.icon);
            return (
              <button
                key={service.id}
                onClick={() => onOpenService(service.id)}
                className="card p-5 text-left hover:border-gov-300 hover:shadow-md transition-all group flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gov-50 to-teal-50 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gov-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {service.category}
                  </span>
                </div>
                <h3 className="font-serif font-semibold text-slate-900 mb-1">{service.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 flex-1">{service.description}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {service.estimated_time}
                  </span>
                  <span className="text-sm text-gov-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Apply <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {service.required_data.map((d) => (
                    <span key={d} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100 capitalize">
                      {d}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
