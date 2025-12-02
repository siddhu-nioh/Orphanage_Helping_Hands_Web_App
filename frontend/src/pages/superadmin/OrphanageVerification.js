import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OrphanageVerification() {
  const navigate = useNavigate();
  const [orphanages, setOrphanages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrphanages();
  }, []);

  const fetchOrphanages = async () => {
    try {
      const response = await axios.get(`${API}/admin/orphanages`);
      setOrphanages(response.data || []);
    } catch (error) {
      console.error('Failed to fetch orphanages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (orphanageId, status) => {
    try {
      await axios.put(`${API}/admin/orphanages/${orphanageId}/verify?status=${status}`);
      toast.success(`Orphanage ${status === 'VERIFIED' ? 'verified' : 'rejected'} successfully`);
      fetchOrphanages();
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50" data-testid="orphanage-verification-page">
      <Navigation />

      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Button variant="ghost" onClick={() => navigate('/admin/dashboard')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold text-slate-900 mb-8">Orphanage Verification</h1>

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
                      <th className="text-left p-4 font-semibold text-slate-700">Name</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Location</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Registration</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                      <th className="text-center p-4 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orphanages.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-600">
                          No orphanages found
                        </td>
                      </tr>
                    ) : (
                      orphanages.map((orphanage) => (
                        <tr key={orphanage.id} className="border-b border-stone-200 hover:bg-stone-50">
                          <td className="p-4 font-medium text-slate-900">{orphanage.name}</td>
                          <td className="p-4 text-slate-600">
                            {orphanage.city}, {orphanage.state}
                          </td>
                          <td className="p-4 text-slate-600">{orphanage.registration_number}</td>
                          <td className="p-4">
                            <Badge
                              variant={orphanage.verification_status === 'VERIFIED' ? 'success' : 'warning'}
                              className={
                                orphanage.verification_status === 'VERIFIED'
                                  ? 'bg-green-100 text-green-800'
                                  : orphanage.verification_status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {orphanage.verification_status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              {orphanage.verification_status !== 'VERIFIED' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleVerify(orphanage.id, 'VERIFIED')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  data-testid={`verify-btn-${orphanage.id}`}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Verify
                                </Button>
                              )}
                              {orphanage.verification_status !== 'REJECTED' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleVerify(orphanage.id, 'REJECTED')}
                                  data-testid={`reject-btn-${orphanage.id}`}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              )}
                            </div>
                          </td>
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