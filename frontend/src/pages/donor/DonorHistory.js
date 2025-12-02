import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { Button } from '../../components/ui/button';
import { Download } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DonorHistory() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await axios.get(`${API}/donations/my`);
      setDonations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50" data-testid="donor-history-page">
      <Navigation />

      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Donation History</h1>

          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-700">Date</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Orphanage</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Amount</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                    <th className="text-center p-4 font-semibold text-slate-700">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </td>
                    </tr>
                  ) : donations.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-600">
                        No donations yet
                      </td>
                    </tr>
                  ) : (
                    donations.map((donation) => (
                      <tr key={donation.id} className="border-b border-stone-200 hover:bg-stone-50">
                        <td className="p-4 text-slate-600">
                          {new Date(donation.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-4 font-medium text-slate-900">{donation.orphanage_name}</td>
                        <td className="p-4 font-bold text-primary">₹{donation.amount.toLocaleString()}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {donation.payment_status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <Button size="sm" variant="ghost" data-testid={`download-receipt-${donation.id}`}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}