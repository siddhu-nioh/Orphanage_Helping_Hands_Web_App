import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { MapPin, Mail, Phone, Users, Heart, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OrphanageProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [orphanage, setOrphanage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrphanage();
  }, [slug]);

  const fetchOrphanage = async () => {
    try {
      const response = await axios.get(`${API}/orphanages/${slug}`);
      setOrphanage(response.data);
    } catch (error) {
      console.error('Failed to fetch orphanage:', error);
    } finally {
      setLoading(false);
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

  const categoryProgress = {
    MEALS: (orphanage.total_donations || 0) / (orphanage.monthly_targets?.MEALS || 1),
    EDUCATION: (orphanage.total_donations || 0) / (orphanage.monthly_targets?.EDUCATION || 1),
    HEALTHCARE: (orphanage.total_donations || 0) / (orphanage.monthly_targets?.HEALTHCARE || 1),
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="orphanage-profile-page">
      <Navigation />

      {/* Cover Image */}
      <div className="relative h-64 md:h-96 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
        {orphanage.cover_image ? (
          <img src={orphanage.cover_image} alt={orphanage.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="w-24 h-24 text-primary/30" />
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 md:-mt-20 pb-6">
            {/* Logo */}
            <div className="relative mb-4 md:mb-0 md:mr-6">
              {orphanage.logo ? (
                <img
                  src={orphanage.logo}
                  alt={orphanage.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white shadow-xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white shadow-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-16 h-16 text-primary" />
                </div>
              )}
              {orphanage.verification_status === 'VERIFIED' && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2" data-testid="verified-badge">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2" data-testid="orphanage-name">
                {orphanage.name}
              </h1>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center text-slate-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{orphanage.address}, {orphanage.city}, {orphanage.state}</span>
                </div>
                <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                  {orphanage.type?.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate(`/donate/${orphanage.id}`)}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 shadow-lg shadow-primary/20"
                  data-testid="donate-now-btn"
                >
                  <Heart className="w-4 h-4 mr-2" fill="currentColor" />
                  Donate Now
                </Button>
                <Button variant="outline" className="border-secondary/20 text-secondary hover:bg-secondary/5 rounded-full" data-testid="contact-btn">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                  <TabsTrigger value="impact" data-testid="tab-impact">Impact</TabsTrigger>
                  <TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-card">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
                    <p className="text-slate-600 leading-relaxed">
                      {orphanage.mission || orphanage.description}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-card">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Monthly Targets</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-slate-700">Meals</span>
                          <span className="text-sm text-slate-600">
                            ₹{orphanage.total_donations?.toLocaleString() || 0} / ₹{orphanage.monthly_targets?.MEALS?.toLocaleString() || 0}
                          </span>
                        </div>
                        <Progress value={Math.min(categoryProgress.MEALS * 100, 100)} className="h-3" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-slate-700">Education</span>
                          <span className="text-sm text-slate-600">
                            ₹{(orphanage.total_donations * 0.3)?.toLocaleString() || 0} / ₹{orphanage.monthly_targets?.EDUCATION?.toLocaleString() || 0}
                          </span>
                        </div>
                        <Progress value={Math.min(categoryProgress.EDUCATION * 30, 100)} className="h-3" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-slate-700">Healthcare</span>
                          <span className="text-sm text-slate-600">
                            ₹{(orphanage.total_donations * 0.2)?.toLocaleString() || 0} / ₹{orphanage.monthly_targets?.HEALTHCARE?.toLocaleString() || 0}
                          </span>
                        </div>
                        <Progress value={Math.min(categoryProgress.HEALTHCARE * 20, 100)} className="h-3" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="impact" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-card">
                      <div className="text-accent font-bold text-4xl mb-2">{orphanage.total_children || 0}</div>
                      <div className="text-slate-600 font-medium">Children Supported</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-card">
                      <div className="text-primary font-bold text-4xl mb-2">₹{((orphanage.total_donations || 0) / 1000).toFixed(1)}K</div>
                      <div className="text-slate-600 font-medium">Total Donations</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-card">
                      <div className="text-secondary font-bold text-4xl mb-2">{(orphanage.total_children * 30) || 0}</div>
                      <div className="text-slate-600 font-medium">Meals Served (Monthly)</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-card">
                      <div className="text-green-500 font-bold text-4xl mb-2">{orphanage.total_children || 0}</div>
                      <div className="text-slate-600 font-medium">Children in Education</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="about" className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-card">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">About {orphanage.name}</h3>
                    <p className="text-slate-600 leading-relaxed mb-6">
                      {orphanage.description}
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Mail className="w-5 h-5 text-primary mr-3 mt-1" />
                        <div>
                          <div className="text-sm text-slate-500">Email</div>
                          <div className="font-medium text-slate-900">{orphanage.email}</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Phone className="w-5 h-5 text-primary mr-3 mt-1" />
                        <div>
                          <div className="text-sm text-slate-500">Phone</div>
                          <div className="font-medium text-slate-900">{orphanage.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Users className="w-5 h-5 text-primary mr-3 mt-1" />
                        <div>
                          <div className="text-sm text-slate-500">Contact Person</div>
                          <div className="font-medium text-slate-900">{orphanage.contact_person}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Children</span>
                    <span className="font-bold text-slate-900">{orphanage.total_children || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Type</span>
                    <span className="font-bold text-slate-900">{orphanage.type?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Registration</span>
                    <span className="font-bold text-slate-900">{orphanage.registration_number}</span>
                  </div>
                </div>
              </div>

              {/* Donation Costs */}
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Cost Breakdown</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Daily meal per child</div>
                    <div className="text-2xl font-bold text-primary">₹{orphanage.per_day_meal_cost}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Monthly education per child</div>
                    <div className="text-2xl font-bold text-secondary">₹{orphanage.per_month_education_cost}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Monthly healthcare</div>
                    <div className="text-2xl font-bold text-accent">₹{orphanage.per_month_healthcare_cost}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}