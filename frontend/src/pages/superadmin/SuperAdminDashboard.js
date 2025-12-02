import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { Button } from '../../components/ui/button';
import { Users, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/platform`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch platform analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50" data-testid="superadmin-dashboard">
      <Navigation />

      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Super Admin Dashboard</h1>
            <p className="text-slate-600">Platform-wide overview and management</p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 mb-8">
            <Button onClick={() => navigate('/admin/verification')} data-testid="verification-btn">
              Orphanage Verification
            </Button>
            <Button onClick={() => navigate('/admin/transactions')} variant="outline" data-testid="transactions-btn">
              Transaction Monitoring
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{analytics?.total_orphanages || 0}</div>
                <div className="text-sm text-slate-600 mt-1">Total Orphanages</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{analytics?.verified_orphanages || 0}</div>
                <div className="text-sm text-slate-600 mt-1">Verified</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{analytics?.pending_orphanages || 0}</div>
                <div className="text-sm text-slate-600 mt-1">Pending Verification</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-3xl font-bold text-slate-900">₹{((analytics?.total_donations || 0) / 100000).toFixed(1)}L</div>
                <div className="text-sm text-slate-600 mt-1">Total Donations</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="text-3xl font-bold text-slate-900">{analytics?.total_donors || 0}</div>
                <div className="text-sm text-slate-600 mt-1">Active Donors</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="text-3xl font-bold text-slate-900">{analytics?.total_transactions || 0}</div>
                <div className="text-sm text-slate-600 mt-1">Total Transactions</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}