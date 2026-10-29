'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Printer,
  X,
  Receipt,
  Shield,
  ArrowUpRight
} from 'lucide-react';
import { useSchoolStore } from '../../../lib/store';
import { FeeInvoice } from '../../../lib/types';

export default function FinancePage() {
  const { fees, students, recordPayment } = useSchoolStore();

  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('Direct Bank Transfer');

  const totalInvoiced = fees.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalPaid = fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalOutstanding = fees.reduce((acc, f) => acc + f.balance, 0);

  const handleOpenPay = (inv: FeeInvoice) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.balance);
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || payAmount <= 0) return;

    recordPayment(selectedInvoice.id, Number(payAmount));
    setIsPayModalOpen(false);
    setSelectedInvoice(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Tuition &amp; School Finance Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Process termly student tuition, bus routes, laboratory levies, and issue verified receipts.
          </p>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--gold-badge)', color: '#b45309' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Invoiced (Term 1)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              &#8358;{totalInvoiced.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dominion 2026/2027 Session</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--emerald-bg)', color: 'var(--emerald)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Realized</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald)' }}>
              &#8358;{totalPaid.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--emerald)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> {Math.round((totalPaid / totalInvoiced) * 100)}% Collection Rate
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--ruby-bg)', color: 'var(--ruby)' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Outstanding Dues</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ruby)' }}>
              &#8358;{totalOutstanding.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--ruby)' }}>Due before Mid-Term Tests</div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Term/Session</th>
              <th>Total Invoiced</th>
              <th>Amount Paid</th>
              <th>Outstanding</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((inv) => {
              const student = students.find((s) => s.id === inv.studentId);

              return (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{inv.invoiceNo}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {student ? `${student.firstName} ${student.lastName}` : 'Enrolled Student'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Adm: {student?.admissionNo}
                    </div>
                  </td>
                  <td>{student?.classLevel}</td>
                  <td>{inv.term} ({inv.session})</td>
                  <td style={{ fontWeight: 700 }}>&#8358;{inv.totalAmount.toLocaleString()}</td>
                  <td style={{ color: 'var(--emerald)', fontWeight: 600 }}>&#8358;{inv.paidAmount.toLocaleString()}</td>
                  <td style={{ color: inv.balance > 0 ? 'var(--ruby)' : 'var(--text-muted)', fontWeight: 700 }}>
                    &#8358;{inv.balance.toLocaleString()}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        inv.status === 'Paid'
                          ? 'badge-emerald'
                          : inv.status === 'Partial'
                          ? 'badge-topaz'
                          : 'badge-ruby'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      {inv.balance > 0 && (
                        <button
                          onClick={() => handleOpenPay(inv)}
                          className="btn btn-primary btn-sm"
                        >
                          Record Payment
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="btn btn-outline btn-sm"
                      >
                        <Receipt size={14} /> Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: Record Fee Payment */}
      {isPayModalOpen && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Record Fee Payment</h2>
              <button
                onClick={() => setIsPayModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment}>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div><strong>Invoice:</strong> {selectedInvoice.invoiceNo}</div>
                <div><strong>Outstanding Balance:</strong> &#8358;{selectedInvoice.balance.toLocaleString()}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Amount (&#8358;) *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedInvoice.balance}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Channel</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-select"
                >
                  <option value="Direct Bank Transfer (Access Bank DIS Account)">Direct Bank Transfer (Access Bank)</option>
                  <option value="Moniepoint POS Terminal (Bursary Desk)">Moniepoint POS Terminal</option>
                  <option value="Zenith Bank Online Portal">Zenith Bank Online Portal</option>
                  <option value="Cash at Bursary">Cash at Bursary</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Bursary Receipt */}
      {selectedInvoice && !isPayModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Dominion School Bursary Receipt</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => window.print()} className="btn btn-primary">
                  <Printer size={16} /> Print Receipt
                </button>
                <button onClick={() => setSelectedInvoice(null)} className="btn btn-outline">
                  Close
                </button>
              </div>
            </div>

            {/* Official Receipt Sheet */}
            <div
              style={{
                border: '2px solid var(--gold-primary)',
                padding: '2rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff'
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '2px solid var(--primary-navy)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <Shield size={32} color="var(--primary-navy)" style={{ margin: '0 auto 0.5rem' }} />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary-navy)' }}>
                  DOMINION INTERNATIONAL SCHOOL
                </h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Plot 14/16 Airport Road, Ajao Estate, Ikeja, Lagos State &bull; Bursary Directorate
                </div>
                <div style={{ marginTop: '0.5rem', fontWeight: 800, color: '#b45309', fontSize: '0.85rem' }}>
                  OFFICIAL PAYMENT RECEIPT &bull; {selectedInvoice.invoiceNo}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                <div><strong>Date Issued:</strong> {selectedInvoice.paidDate || '2026-10-29'}</div>
                <div><strong>Session/Term:</strong> {selectedInvoice.term} ({selectedInvoice.session})</div>
                <div>
                  <strong>Student:</strong>{' '}
                  {students.find((s) => s.id === selectedInvoice.studentId)?.firstName}{' '}
                  {students.find((s) => s.id === selectedInvoice.studentId)?.lastName}
                </div>
                <div>
                  <strong>Adm No:</strong>{' '}
                  {students.find((s) => s.id === selectedInvoice.studentId)?.admissionNo}
                </div>
              </div>

              {/* Items Breakdown */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Item Description</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount (&#8358;)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>Tuition &amp; Cambridge Curriculum</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>{selectedInvoice.tuitionFee.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>Development &amp; Campus Facilities</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>{selectedInvoice.developmentLevy.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>ICT &amp; Robotics Laboratory</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>{selectedInvoice.ictRobotics.toLocaleString()}</td>
                  </tr>
                  {selectedInvoice.busFee ? (
                    <tr>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>Air-Conditioned Bus Service</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>{selectedInvoice.busFee.toLocaleString()}</td>
                    </tr>
                  ) : null}
                  {selectedInvoice.lunchFee ? (
                    <tr>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>Daily Hot Lunch Program</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>{selectedInvoice.lunchFee.toLocaleString()}</td>
                    </tr>
                  ) : null}
                  <tr style={{ fontWeight: 800, borderTop: '2px solid #000' }}>
                    <td style={{ padding: '0.5rem' }}>Total Fee Invoiced</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>&#8358;{selectedInvoice.totalAmount.toLocaleString()}</td>
                  </tr>
                  <tr style={{ fontWeight: 800, color: 'var(--emerald)' }}>
                    <td style={{ padding: '0.5rem' }}>Total Paid to Date</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>&#8358;{selectedInvoice.paidAmount.toLocaleString()}</td>
                  </tr>
                  <tr style={{ fontWeight: 800, color: selectedInvoice.balance > 0 ? 'var(--ruby)' : 'inherit' }}>
                    <td style={{ padding: '0.5rem' }}>Balance Remaining</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>&#8358;{selectedInvoice.balance.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                <div>Bursar Stamp: <em>VERIFIED &bull; DIS BURSARY</em></div>
                <div>Status: <strong style={{ color: selectedInvoice.status === 'Paid' ? 'var(--emerald)' : 'var(--topaz)' }}>{selectedInvoice.status.toUpperCase()}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

