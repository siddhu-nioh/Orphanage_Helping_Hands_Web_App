import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import axios from 'axios';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import OrphanageCard from '../components/OrphanageCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OrphanageDirectory() {
  const [orphanages, setOrphanages] = useState([]);
  const [filteredOrphanages, setFilteredOrphanages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  useEffect(() => {
    fetchOrphanages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, typeFilter, verifiedFilter, orphanages]);

  const fetchOrphanages = async () => {
    try {
      const response = await axios.get(`${API}/orphanages`);
      setOrphanages(response.data || []);
    } catch (error) {
      console.error('Failed to fetch orphanages:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orphanages];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.name.toLowerCase().includes(query) ||
          o.city.toLowerCase().includes(query) ||
          o.state.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((o) => o.type === typeFilter);
    }

    // Verification filter
    if (verifiedFilter === 'verified') {
      filtered = filtered.filter((o) => o.verification_status === 'VERIFIED');
    } else if (verifiedFilter === 'pending') {
      filtered = filtered.filter((o) => o.verification_status === 'PENDING');
    }

    setFilteredOrphanages(filtered);
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="orphanage-directory-page">
      <Navigation />

      <div className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-br from-[#FDFBF7] via-[#FFF5F0] to-[#FFF0EB] py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4" data-testid="directory-title">
              Find Orphanages
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Discover verified orphanages across India. Choose where you want to make an impact.
            </p>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search by name, city, or state..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 rounded-full border-stone-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    data-testid="search-input"
                  />
                </div>

                {/* Type Filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-12 rounded-lg" data-testid="type-filter">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="BOYS_ONLY">Boys Only</SelectItem>
                    <SelectItem value="GIRLS_ONLY">Girls Only</SelectItem>
                    <SelectItem value="MIXED">Mixed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Verification Filter */}
                <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                  <SelectTrigger className="h-12 rounded-lg" data-testid="verification-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900" data-testid="results-count">
                  {filteredOrphanages.length} Orphanage{filteredOrphanages.length !== 1 ? 's' : ''} Found
                </h2>
                <p className="text-sm text-slate-600">Showing verified and pending orphanages</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 bg-stone-100 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredOrphanages.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No orphanages found</h3>
                <p className="text-slate-600">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="orphanages-grid">
                {filteredOrphanages.map((orphanage) => (
                  <OrphanageCard key={orphanage.id} orphanage={orphanage} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}