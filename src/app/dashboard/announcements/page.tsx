'use client';

import React, { useState } from 'react';
import { Bell, Plus, X, Calendar, User, CheckCircle2 } from 'lucide-react';
import { useSchoolStore } from '../../../lib/store';
import { Announcement } from '../../../lib/types';

export default function AnnouncementsPage() {
  const { announcements, addAnnouncement } = useSchoolStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('Academic');
  const [targetRole, setTargetRole] = useState<Announcement['targetRole']>('All');
  const [author, setAuthor] = useState('School Principal');
  const [content, setContent] = useState('');

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    addAnnouncement({
      title,
      category,
      targetRole,
      author,
      content
    });

    // Trigger email broadcast for announcements
    const emailType =
      category === 'Emergency'
        ? 'urgent_advisory'
        : title.toLowerCase().includes('pta')
        ? 'pta_meeting'
        : 'newsletter';

    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: emailType,
        payload: {
          recipientEmail: 'community@dominioninternational.sch.ng',
          recipientName: 'Dominion International School Community',
          title,
          headline: title,
          advisoryBody: content,
          highlightSnippet: content,
          meetingDate: 'Upcoming Saturday at 10:00 AM',
          meetingTime: '10:00 AM WAT'
        }
      })
    }).catch((err) => console.warn('Announcement email broadcast notice:', err));

    setIsModalOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Official Notices &amp; Broadcasts
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Publish circulars, sports schedules, and academic updates to staff, parents, and students.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Broadcast Announcement
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {announcements.map((anc) => (
          <div key={anc.id} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  className={`badge ${
                    anc.category === 'Sports'
                      ? 'badge-emerald'
                      : anc.category === 'Academic'
                      ? 'badge-sapphire'
                      : anc.category === 'Event'
                      ? 'badge-gold'
                      : 'badge-topaz'
                  }`}
                >
                  {anc.category}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={13} /> {anc.date}
                </span>
                <span className="badge badge-sapphire" style={{ fontSize: '0.7rem' }}>
                  Audience: {anc.targetRole}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={13} /> Posted by <strong>{anc.author}</strong>
              </div>
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
              {anc.title}
            </h3>
            <p style={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {anc.content}
            </p>
          </div>
        ))}
      </div>

      {/* Modal: Broadcast Announcement */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Publish Official Notice</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement}>
              <div className="form-group">
                <label className="form-label">Announcement Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Mid-Term Break Schedule &amp; Project Submissions"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Sports">Sports &amp; Houses</option>
                    <option value="Event">Event / Celebration</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Emergency">Urgent Advisory / Emergency</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="All">All School (Everyone)</option>
                    <option value="Parents">Parents Only</option>
                    <option value="Teachers">Teachers / Faculty Only</option>
                    <option value="Students">Students Only</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Author / Office</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content Body *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="form-input"
                  placeholder="Provide circular details..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish to Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

