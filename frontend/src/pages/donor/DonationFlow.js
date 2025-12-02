import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../../components/Navigation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DonationFlow() {
  const { orphanageId } = useParams();
  const navigate = useNavigate();
  const [orphanage, setOrphanage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [donationData, setDonationData] = useState({
    amount: '',
    breakdown: {
      MEALS: 0,
      EDUCATION: 0,
      HEALTHCARE: 0,
    },
    message: '',
    is_anonymous: false,
  });

  useEffect(() => {
    fetchOrphanage();
  }, [orphanageId]);

  const fetchOrphanage = async () => {
    try {
      const response = await axios.get(`${API}/orphanages?search=`);
      const orph = response.data.find(o => o.id === orphanageId);
      setOrphanage(orph);
    } catch (error) {
      console.error('Failed to fetch orphanage:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    setDonationData({
      ...donationData,
      amount,
      breakdown: {
        MEALS: numAmount * 0.5,
        EDUCATION: numAmount * 0.3,
        HEALTHCARE: numAmount * 0.2,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API}/donations/create`, {
        orphanage_id: orphanageId,
        amount: parseFloat(donationData.amount),
        breakdown: donationData.breakdown,
        message: donationData.message,
        is_anonymous: donationData.is_anonymous,
      });

      navigate('/donation/success', { state: { amount: donationData.amount, orphanage: orphanage?.name } });
    } catch (error) {
      toast.error('Donation failed. Please try again.');
      console.error('Donation error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!orphanage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Orphanage Not Found</h2>
            <Button onClick={() => navigate('/orphanages')}>Browse Orphanages</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50" data-testid="donation-flow-page">
      <Navigation />

      <div className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Make a Donation</h1>
            <p className="text-lg text-slate-600">to {orphanage.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-card space-y-6">
            {/* Amount */}
            <div>
              <Label htmlFor="amount" className="text-lg font-semibold">Donation Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={donationData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                required
                min="1"
                className="mt-2 h-14 text-2xl font-bold"
                data-testid="donation-amount-input"
              />
            </div>

            {/* Breakdown */}
            {donationData.amount && (
              <div className="bg-stone-50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Amount Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Meals (50%)</span>
                    <span className="font-bold text-slate-900">₹{donationData.breakdown.MEALS.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Education (30%)</span>
                    <span className="font-bold text-slate-900">₹{donationData.breakdown.EDUCATION.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Healthcare (20%)</span>
                    <span className="font-bold text-slate-900">₹{donationData.breakdown.HEALTHCARE.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Leave a message for the orphanage..."
                value={donationData.message}
                onChange={(e) => setDonationData({ ...donationData, message: e.target.value })}
                className="mt-2"
                rows={4}
                data-testid="donation-message-input"
              />
            </div>

            {/* Anonymous */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={donationData.is_anonymous}
                onCheckedChange={(checked) => setDonationData({ ...donationData, is_anonymous: checked })}
                data-testid="anonymous-checkbox"
              />
              <label htmlFor="anonymous" className="text-sm text-slate-600 cursor-pointer">
                Make this donation anonymous
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting || !donationData.amount}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-lg font-bold"
              data-testid="proceed-payment-btn"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" fill="currentColor" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}