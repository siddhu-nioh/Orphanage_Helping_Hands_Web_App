import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { Button } from '../../components/ui/button';
import { CheckCircle2, Heart } from 'lucide-react';

export default function DonationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, orphanage } = location.state || {};

  return (
    <div className="min-h-screen flex flex-col bg-stone-50" data-testid="donation-success-page">
      <Navigation />

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          {/* Success Animation */}
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>

          {/* Message */}
          <h1 className="text-4xl font-bold text-slate-900 mb-4" data-testid="success-title">
            Thank You for Your Generosity!
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Your donation of <span className="font-bold text-primary">₹{parseFloat(amount).toLocaleString()}</span> to{' '}
            <span className="font-bold">{orphanage}</span> has been processed successfully.
          </p>

          <div className="bg-primary/5 rounded-2xl p-6 mb-8">
            <p className="text-slate-700 leading-relaxed">
              You've made a real difference today! Your contribution will help provide meals, education, and care to children in need.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/donor/dashboard')}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6"
              data-testid="view-donations-btn"
            >
              View My Donations
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/orphanages')}
              className="w-full border-secondary/20 text-secondary hover:bg-secondary/5 rounded-full py-6"
              data-testid="donate-again-btn"
            >
              <Heart className="w-4 h-4 mr-2" />
              Donate to Another Orphanage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}