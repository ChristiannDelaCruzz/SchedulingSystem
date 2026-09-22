// src/pages/Admin/SentEmails.tsx
import React, { useState, useMemo } from 'react';
import { Mail, RefreshCw, Eye, X, Search } from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';

// ============================================
// MOCK EMAIL RECORDS
// ============================================
interface EmailRecord {
  id: string;
  to_email: string;
  subject: string;
  body_html: string;
  status: 'sent' | 'pending' | 'failed';
  sent_at?: string;
  created_at: string;
}

const mockEmails: EmailRecord[] = [
  {
    id: 'email-1',
    to_email: 'ana.lopez@test.com',
    subject: 'Welcome to SchedulePro — Your Enrollment is Approved',
    body_html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #155E75, #164E63); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Enrollment Approved</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Your academic journey starts here</p>
        </div>
        <div style="background: white; padding: 32px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 16px 16px;">
          <p style="color: #0F172A; font-size: 16px; margin-top: 0;">Hello <strong>Ana Lopez</strong>,</p>
          <p style="color: #475569; line-height: 1.6;">
            We are pleased to inform you that your enrollment application has been approved. Your student account is now ready.
          </p>
          <div style="background: #F8FAFC; border-left: 4px solid #06B6D4; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Student Number</p>
            <p style="margin: 4px 0 0; font-size: 22px; font-weight: 700; color: #155E75; font-family: monospace;">SP-2026-00042</p>
          </div>
          <p style="color: #475569; line-height: 1.6;">Please log in to the student portal using the credentials provided by your administrator.</p>
          <p style="color: #64748B; font-size: 13px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E2E8F0;">
            Best regards,<br><strong>SchedulePro Admissions</strong>
          </p>
        </div>
      </div>
    `,
    status: 'sent',
    sent_at: '2026-07-16T09:05:00Z',
    created_at: '2026-07-16T09:05:00Z',
  },
  {
    id: 'email-2',
    to_email: 'mark.v@test.com',
    subject: 'Your Enrollment Application is Under Review',
    body_html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #F59E0B, #D97706); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Application Under Review</h1>
        </div>
        <div style="background: white; padding: 32px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 16px 16px;">
          <p style="color: #0F172A; font-size: 16px; margin-top: 0;">Hello <strong>Mark Villanueva</strong>,</p>
          <p style="color: #475569; line-height: 1.6;">
            Your enrollment application is currently being reviewed by our admissions team. We will notify you once a decision has been made.
          </p>
          <p style="color: #475569; line-height: 1.6;">
            Application Number: <strong style="font-family: monospace;">APP-2026-0002</strong>
          </p>
          <p style="color: #64748B; font-size: 13px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E2E8F0;">
            Best regards,<br><strong>SchedulePro Admissions</strong>
          </p>
        </div>
      </div>
    `,
    status: 'sent',
    sent_at: '2026-07-18T10:20:00Z',
    created_at: '2026-07-18T10:20:00Z',
  },
  {
    id: 'email-3',
    to_email: 'carlo.b@test.com',
    subject: 'Correction Required — Enrollment Application',
    body_html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #EA580C, #C2410C); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Correction Required</h1>
        </div>
        <div style="background: white; padding: 32px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 16px 16px;">
          <p style="color: #0F172A; font-size: 16px; margin-top: 0;">Hello <strong>Carlo Bautista</strong>,</p>
          <p style="color: #475569; line-height: 1.6;">
            Your enrollment application requires the following correction before we can proceed:
          </p>
          <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; color: #78350F; line-height: 1.6;">Please submit a copy of your previous TOR.</p>
          </div>
          <p style="color: #475569; line-height: 1.6;">Kindly update your application at your earliest convenience.</p>
          <p style="color: #64748B; font-size: 13px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E2E8F0;">
            Best regards,<br><strong>SchedulePro Admissions</strong>
          </p>
        </div>
      </div>
    `,
    status: 'sent',
    sent_at: '2026-07-23T09:10:00Z',
    created_at: '2026-07-23T09:10:00Z',
  },
];

// ============================================
// MAIN
// ============================================
export const SentEmails: React.FC = () => {
  const { showToast } = useToast();
  const [emails, setEmails] = useState<EmailRecord[]>(mockEmails);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);

  const filteredEmails = useMemo(() => {
    if (!searchQuery) return emails;
    const q = searchQuery.toLowerCase();
    return emails.filter(
      (e) =>
        e.to_email.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q)
    );
  }, [emails, searchQuery]);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return d;
    }
  };

  const handleRefresh = () => {
    setEmails([...mockEmails]);
    showToast('success', 'Refreshed', 'Email list updated.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Sent Emails
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            All emails sent from the system — enrollment credentials, notifications, and more.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
          Refresh
        </Button>
      </div>

      {/* SEARCH */}
      <Card noPadding>
        <div className="p-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email or subject..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan focus:bg-white transition-all"
            />
          </div>
        </div>
      </Card>

      {/* LIST */}
      <Card noPadding>
        {filteredEmails.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No emails found</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? 'Try a different search term.' : 'Emails sent by the system will appear here.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredEmails.map((email) => (
              <li
                key={email.id}
                className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => setSelectedEmail(email)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {email.subject}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          To: <span className="font-medium">{email.to_email}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            email.status === 'sent'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : email.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {email.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400 hidden sm:inline">
                          {formatDate(email.created_at)}
                        </span>
                        <Eye className="w-4 h-4 text-slate-300 group-hover:text-cyan transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* EMAIL PREVIEW MODAL */}
      <Modal
        isOpen={!!selectedEmail}
        onClose={() => setSelectedEmail(null)}
        maxWidth="max-w-4xl"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 truncate">
              {selectedEmail?.subject}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              To: {selectedEmail?.to_email} · {selectedEmail && formatDate(selectedEmail.created_at)}
            </p>
          </div>
          <button
            onClick={() => setSelectedEmail(null)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 p-6">
          <div
            className="bg-white rounded-xl shadow-sm"
            dangerouslySetInnerHTML={{ __html: selectedEmail?.body_html || '' }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default SentEmails;