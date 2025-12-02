import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TransactionMonitoring() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = donations.filter((d) => d.gateway_reference?.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredDonations(filtered);
    } else {
      setFilteredDonations(donations);
    }
  }, [searchQuery, donations]);

  const fetchDonations = async () => {
    try {
      const response = await axios.get(`${API}/admin/donations`);
      setDonations(response.data || []);
      setFilteredDonations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50" data-testid="transaction-monitoring-page">
      <Navigation />

      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Button variant="ghost" onClick={() => navigate('/admin/dashboard')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold text-slate-900 mb-8">Transaction Monitoring</h1>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12"
                data-testid="transaction-search"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-700">Date</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Transaction ID</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Amount</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Orphanage ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-600">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      filteredDonations.map((donation) => (
                        <tr key={donation.id} className="border-b border-stone-200 hover:bg-stone-50">
                          <td className="p-4 text-slate-600">
                            {new Date(donation.created_at).toLocaleDateString('en-IN')}
                          </td>
                          <td className="p-4 font-mono text-sm text-slate-600">
                            {donation.gateway_reference || donation.id}
                          </td>
                          <td className="p-4 font-bold text-primary">₹{donation.amount.toLocaleString()}</td>
                          <td className="p-4">
                            <Badge
                              className={
                                donation.payment_status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-800'
                                  : donation.payment_status === 'FAILED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {donation.payment_status}
                            </Badge>
                          </td>
                          <td className="p-4 text-slate-600 font-mono text-sm">{donation.orphanage_id}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}