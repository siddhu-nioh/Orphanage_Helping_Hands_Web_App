import React from 'react';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StaffManagement() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50" data-testid="staff-management-page">
      <Navigation />

      <div className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <Button variant="ghost" onClick={() => navigate('/orphanage-admin/dashboard')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold text-slate-900 mb-8">Manage Staff</h1>

          <div className="bg-white rounded-2xl p-8 shadow-card">
            <p className="text-slate-600">Staff management interface coming soon...</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}