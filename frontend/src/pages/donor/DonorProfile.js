import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { User } from 'lucide-react';
import { toast } from 'sonner';

export default function DonorProfile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || 'India',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50" data-testid="donor-profile-page">
      <Navigation />

      <div className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Profile Settings</h1>

          <div className="bg-white rounded-2xl p-8 shadow-card">
            {/* Avatar */}
            <div className="flex items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-primary font-bold text-3xl">{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
                <p className="text-slate-600">{user?.email}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-8"
                data-testid="save-profile-btn"
              >
                Save Changes
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}