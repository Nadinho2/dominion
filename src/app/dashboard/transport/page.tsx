'use client';

import React, { useState } from 'react';
import { Bus, MapPin, Phone, Users, ShieldCheck, AlertCircle } from 'lucide-react';
import { useSchoolStore } from '../../../lib/store';

export default function TransportPage() {
  const { busRoutes } = useSchoolStore();
  const [advisorySent, setAdvisorySent] = useState<string | null>(null);

  const handleBroadcastDelay = async (routeVehicle: string, routeTitle: string) => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bus_delay',
          payload: {
            guardianEmail: 'transit-parents@dominioninternational.sch.ng',
            guardianName: 'Transit Route Parents',
            routeNumber: routeVehicle,
            routeName: routeTitle,
            delayEstimate: '15 - 20 Minutes',
            reason: 'Heavy evening traffic buildup along Airport Road corridor & Ajao Junction'
          }
        })
      });
      setAdvisorySent(routeVehicle);
      setTimeout(() => setAdvisorySent(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
          School Transportation &amp; Fleet Management
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Dedicated air-conditioned school bus fleet routes covering Ajao Estate, Mafoluku, Oshodi, Isolo, and Okota.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {busRoutes.map((route) => (
          <div key={route.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="badge badge-gold">{route.zone}</span>
                <span className="badge badge-emerald">
                  <ShieldCheck size={12} /> Live Tracking Active
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--gold-badge)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#b45309'
                  }}
                >
                  <Bus size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                    {route.vehicleNo}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {route.routeTitle}
                  </div>
                </div>
              </div>

              {/* Driver & Capacity */}
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  marginBottom: '1rem'
                }}
              >
                <div>
                  <strong>Assigned Driver:</strong> {route.driverName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={13} color="var(--text-muted)" />
                  <span>{route.driverPhone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users size={13} color="var(--text-muted)" />
                  <span>
                    Occupancy: <strong>{route.registeredStudents} / {route.capacity} seats</strong>
                  </span>
                </div>
              </div>

              {/* Designated Stops */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Designated Pick-up &amp; Drop Stops:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {route.stops.map((stop, sIdx) => (
                    <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                      <MapPin size={13} color="var(--gold-primary)" />
                      <span>{stop}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => handleBroadcastDelay(route.vehicleNo, route.routeTitle)}
                className="btn btn-outline btn-sm"
                style={{ borderColor: 'var(--gold-primary)', color: 'var(--primary-navy)' }}
              >
                <AlertCircle size={14} color="#d97706" />
                {advisorySent === route.vehicleNo ? '✓ Delay Advisory Broadcasted' : 'Notify Parents of Traffic Delay'}
              </button>
              <button className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                View Manifest &amp; Passenger List
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

