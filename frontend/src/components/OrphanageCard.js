import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, CheckCircle2, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export default function OrphanageCard({ orphanage }) {
  const navigate = useNavigate();

  const progressPercentage = orphanage.monthly_targets?.MEALS
    ? (orphanage.total_donations / orphanage.monthly_targets.MEALS) * 100
    : 0;

  return (
    <div
      className="bg-white rounded-2xl border border-stone-100 shadow-card hover:shadow-card_hover transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={() => navigate(`/orphanage/${orphanage.slug}`)}
      data-testid={`orphanage-card-${orphanage.slug}`}
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
        {orphanage.cover_image ? (
          <img
            src={orphanage.cover_image}
            alt={orphanage.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="w-16 h-16 text-primary/20" />
          </div>
        )}
        {orphanage.verification_status === 'VERIFIED' && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white" data-testid="verified-badge">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )}
      </div>

      <div className="p-6">
        {/* Logo & Name */}
        <div className="flex items-start space-x-3 mb-3">
          {orphanage.logo ? (
            <img src={orphanage.logo} alt={orphanage.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
              {orphanage.name}
            </h3>
            <div className="flex items-center text-sm text-slate-500">
              <MapPin className="w-4 h-4 mr-1" />
              {orphanage.city}, {orphanage.state}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
          {orphanage.description || orphanage.mission}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center text-slate-600 text-xs mb-1">
              <Users className="w-3 h-3 mr-1" />
              Children
            </div>
            <div className="text-lg font-bold text-slate-900">{orphanage.total_children || 0}</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="text-slate-600 text-xs mb-1">Total Raised</div>
            <div className="text-lg font-bold text-primary">₹{(orphanage.total_donations || 0).toLocaleString()}</div>
          </div>
        </div>

        {/* Progress */}
        {orphanage.monthly_targets?.MEALS && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-600 mb-2">
              <span>Monthly Goal Progress</span>
              <span className="font-semibold">{Math.min(progressPercentage, 100).toFixed(0)}%</span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-secondary/20 text-secondary hover:bg-secondary/5 hover:border-secondary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/orphanage/${orphanage.slug}`);
            }}
            data-testid={`view-profile-btn-${orphanage.slug}`}
          >
            View Profile
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg shadow-primary/20"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/donate/${orphanage.id}`);
            }}
            data-testid={`donate-btn-${orphanage.slug}`}
          >
            <Heart className="w-4 h-4 mr-2" fill="currentColor" />
            Donate
          </Button>
        </div>
      </div>
    </div>
  );
}