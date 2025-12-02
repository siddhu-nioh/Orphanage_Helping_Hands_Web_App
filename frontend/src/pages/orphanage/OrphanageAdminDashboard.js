import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { Button } from '../../components/ui/button';
import { DollarSign, Users, TrendingUp, Heart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OrphanageAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.orphanage_id) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/orphanage/${user.orphanage_id}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryData = analytics?.category_totals
    ? Object.entries(analytics.category_totals).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50" data-testid="orphanage-admin-dashboard">
      <Navigation />

      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Orphanage Dashboard</h1>
            <p className="text-slate-600">Monitor your donations and impact</p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 mb-8">
            <Button onClick={() => navigate('/orphanage-admin/manage')} data-testid="manage-profile-btn">
              Manage Profile
            </Button>
            <Button onClick={() => navigate('/orphanage-admin/children')} variant="outline" data-testid="manage-children-btn">
              Manage Children
            </Button>
            <Button onClick={() => navigate('/orphanage-admin/staff')} variant="outline" data-testid="manage-staff-btn">
              Manage Staff
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">₹{(analytics?.total_donations || 0).toLocaleString()}</div>
                  <div className="text-sm text-slate-600 mt-1">Total Donations</div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">₹{(analytics?.this_month || 0).toLocaleString()}</div>
                  <div className="text-sm text-slate-600 mt-1">This Month</div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{analytics?.total_donors || 0}</div>
                  <div className="text-sm text-slate-600 mt-1">Total Donors</div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-green-600" fill="currentColor" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">₹{(analytics?.this_year || 0).toLocaleString()}</div>
                  <div className="text-sm text-slate-600 mt-1">This Year</div>
                </div>
              </div>

              {/* Chart */}
              {categoryData.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-card mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Donations by Category</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#FF8C69" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}