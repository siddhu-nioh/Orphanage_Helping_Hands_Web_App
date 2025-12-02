import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import OrphanageCard from '../components/OrphanageCard';
import { Button } from '../components/ui/button';
import { Heart, Target, Shield, TrendingUp, Users, DollarSign } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LandingPage() {
  const navigate = useNavigate();
  const [featuredOrphanages, setFeaturedOrphanages] = useState([]);
  const [stats, setStats] = useState({
    totalOrphanages: 0,
    totalDonations: 0,
    livesTouched: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orphanagesRes] = await Promise.all([
        axios.get(`${API}/orphanages?verified=true`),
      ]);

      const orphanages = orphanagesRes.data || [];
      setFeaturedOrphanages(orphanages.slice(0, 3));

      // Calculate stats
      const totalDonations = orphanages.reduce((sum, o) => sum + (o.total_donations || 0), 0);
      const livesTouched = orphanages.reduce((sum, o) => sum + (o.total_children || 0), 0);

      setStats({
        totalOrphanages: orphanages.length,
        totalDonations,
        livesTouched,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="landing-page">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#FDFBF7] via-[#FFF5F0] to-[#FFF0EB] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6" data-testid="hero-title">
                Transform Lives with
                <span className="text-primary block mt-2">Transparent Giving</span>
              </h1>
              <p className="text-lg leading-relaxed text-slate-600 mb-8">
                Connect directly with verified orphanages. Track every rupee. See real-time impact.
                Join thousands making a difference in children's lives.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/orphanages')}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                  data-testid="hero-donate-btn"
                >
                  <Heart className="w-5 h-5 mr-2" fill="currentColor" />
                  Start Donating
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/about')}
                  className="border-2 border-secondary/20 text-secondary hover:border-secondary hover:bg-secondary/5 rounded-full px-8 py-6 text-lg font-semibold transition-all"
                  data-testid="hero-learn-btn"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1650498438073-e98824700b85?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwyfHxoYXBweSUyMGRpdmVyc2UlMjBjaGlsZHJlbiUyMHBsYXlpbmclMjBvdXRkb29yc3xlbnwwfHx8fDE3NjQ2NDkzNDd8MA&ixlib=rb-4.1.0&q=85"
                  alt="Happy children"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="text-accent font-bold text-4xl accent-font mb-1">{stats.livesTouched}+</div>
                <div className="text-sm text-slate-600 font-medium">Lives Touched</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center" data-testid="stat-orphanages">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">{stats.totalOrphanages}+</div>
              <div className="text-slate-600 font-medium">Verified Orphanages</div>
            </div>
            <div className="text-center" data-testid="stat-donations">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
                <DollarSign className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">₹{(stats.totalDonations / 100000).toFixed(1)}L+</div>
              <div className="text-slate-600 font-medium">Total Donations</div>
            </div>
            <div className="text-center" data-testid="stat-children">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                <Heart className="w-8 h-8 text-accent" fill="currentColor" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">{stats.livesTouched}+</div>
              <div className="text-slate-600 font-medium">Children Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">Why Choose OrphanCare?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We're not just another charity platform. We're a movement for transparent, impactful giving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card_hover transition-all" data-testid="feature-transparency">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">100% Transparency</h3>
              <p className="text-slate-600 leading-relaxed">
                Every rupee is tracked. See exactly where your donation goes and the impact it creates in real-time.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card_hover transition-all" data-testid="feature-verified">
              <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Verified Orphanages</h3>
              <p className="text-slate-600 leading-relaxed">
                All orphanages are thoroughly verified. Donate with confidence knowing your funds reach legitimate organizations.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card_hover transition-all" data-testid="feature-impact">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Real-Time Impact</h3>
              <p className="text-slate-600 leading-relaxed">
                Track your impact with detailed reports. See how your donations are changing lives every single day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Orphanages */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">Featured Orphanages</h2>
              <p className="text-lg text-slate-600">Make a difference today. Every contribution counts.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/orphanages')}
              className="hidden md:inline-flex border-secondary/20 text-secondary hover:bg-secondary/5 hover:border-secondary"
              data-testid="view-all-orphanages-btn"
            >
              View All
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-stone-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="featured-orphanages-list">
              {featuredOrphanages.map((orphanage) => (
                <OrphanageCard key={orphanage.id} orphanage={orphanage} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Button
              variant="outline"
              onClick={() => navigate('/orphanages')}
              className="border-secondary/20 text-secondary hover:bg-secondary/5 hover:border-secondary"
            >
              View All Orphanages
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6" data-testid="cta-title">
            Ready to Make an Impact?
          </h2>
          <p className="text-lg leading-relaxed text-slate-600 mb-8">
            Join our community of donors and start changing lives today. Your generosity can provide meals, education, and hope.
          </p>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 py-6 text-lg font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
            data-testid="cta-getstarted-btn"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}