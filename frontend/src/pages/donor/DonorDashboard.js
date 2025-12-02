import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { Button } from '../../components/ui/button';
import { Heart, TrendingUp, Calendar, Users } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DonorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonated: 0,
    donationCount: 0,
    orphanagesSupported: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await axios.get(`${API}/donations/my`);
      const donationData = response.data || [];
      setDonations(donationData);

      // Calculate stats
      const totalDonated = donationData.reduce((sum, d) => sum + d.amount, 0);
      const uniqueOrphanages = new Set(donationData.map(d => d.orphanage_id));

      setStats({
        totalDonated,
        donationCount: donationData.length,
        orphanagesSupported: uniqueOrphanages.size,
      });
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50" data-testid="donor-dashboard">
      <Navigation />

      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-slate-600">Here's your giving impact summary</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-card" data-testid="stat-total-donated">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" fill="currentColor" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">₹{stats.totalDonated.toLocaleString()}</div>
              <div className="text-sm text-slate-600">Total Donated</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-card" data-testid="stat-donation-count">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.donationCount}</div>
              <div className="text-sm text-slate-600">Donations Made</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-card" data-testid="stat-orphanages-supported">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.orphanagesSupported}</div>
              <div className="text-sm text-slate-600">Orphanages Supported</div>
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Recent Donations</h2>
              <Button variant="outline" onClick={() => navigate('/donor/history')} data-testid="view-all-btn">
                View All
              </Button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-stone-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No donations yet</h3>
                <p className="text-slate-600 mb-6">Start making a difference today!</p>
                <Button onClick={() => navigate('/orphanages')} data-testid="browse-orphanages-btn">
                  Browse Orphanages
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.slice(0, 5).map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                    data-testid={`donation-${donation.id}`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{donation.orphanage_name}</div>
                      <div className="text-sm text-slate-600">
                        {new Date(donation.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary text-lg">₹{donation.amount.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">{donation.payment_status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}