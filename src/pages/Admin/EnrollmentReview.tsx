// src/pages/Admin/EnrollmentReview.tsx
import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  Search,
  Check,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Mail,
  GraduationCap,
  Loader2,
  Copy,
  RotateCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { usePersistentState } from '../../hooks/usePersistentState';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import Modal from '../../components/ui/Modal';
import { mockEnrollments } from '../../mocks/enrollments';
import type { EnrollmentApplicationWithDetails } from '../../types';

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
    needs_correction: 'bg-orange-50 text-orange-700 border-orange-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return styles[status] || styles.draft;
};

const getStatusLabel = (status: string) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  borderColor?: string;
}> = ({ icon: Icon, label, value, color, borderColor }) => (
  <div className={`bg-white rounded-2xl border ${borderColor || 'border-slate-200'} p-5`}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} mb-3`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
    <p className="text-sm font-medium text-slate-600 mt-1.5">{label}</p>
  </div>
);

export const EnrollmentReview: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [applications, setApplications, resetApplications] = usePersistentState<
    EnrollmentApplicationWithDetails[]
  >('smart_sched_enrollments', mockEnrollments.map((a) => ({ ...a })));

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<EnrollmentApplicationWithDetails | null>(null);
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    studentNumber: string;
    password: string;
  } | null>(null);

  const filteredApplications = useMemo(() => {
    return applications.filter((a) => {
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          (a.application_number || '').toLowerCase().includes(q) ||
          `${a.student?.first_name || ''} ${a.student?.last_name || ''}`
            .toLowerCase()
            .includes(q) ||
          (a.student?.email || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [applications, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(
      (a) => a.status === 'under_review' || a.status === 'submitted'
    ).length;
    const approved = applications.filter((a) => a.status === 'approved').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [applications]);

  const filterTabs = [
    { key: 'all', label: 'All', color: 'bg-navy' },
    { key: 'submitted', label: 'Submitted', color: 'bg-blue-600' },
    { key: 'under_review', label: 'Under Review', color: 'bg-amber-600' },
    { key: 'needs_correction', label: 'Needs Correction', color: 'bg-orange-600' },
    { key: 'approved', label: 'Approved', color: 'bg-emerald-600' },
    { key: 'rejected', label: 'Rejected', color: 'bg-red-600' },
  ];

  const openReview = (app: EnrollmentApplicationWithDetails) => {
    setSelectedApp(app);
    setShowReviewModal(true);
  };

  const openCorrection = (app: EnrollmentApplicationWithDetails) => {
    setSelectedApp(app);
    setCorrectionNotes('');
    setShowCorrectionModal(true);
  };

  const handleApprove = () => {
    if (!selectedApp) return;
    setIsSubmitting(true);

    const year = new Date().getFullYear();
    const studentNumber = `SP-${year}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
    const password = `Student${year}!${Math.floor(1000 + Math.random() * 9000)}`;

    setApplications((prev) =>
      prev.map((a) =>
        a.id === selectedApp.id
          ? { ...a, status: 'approved', reviewed_at: new Date().toISOString() }
          : a
      )
    );

    setCredentials({
      email: selectedApp.student?.email || '',
      studentNumber,
      password,
    });

    setShowReviewModal(false);
    setShowCredentialsModal(true);
    showToast('success', 'Enrollment Approved', `Student number: ${studentNumber}`);
    setIsSubmitting(false);
  };

  const handleReject = () => {
    if (!selectedApp) return;
    setIsSubmitting(true);

    setApplications((prev) =>
      prev.map((a) =>
        a.id === selectedApp.id
          ? { ...a, status: 'rejected', reviewed_at: new Date().toISOString() }
          : a
      )
    );

    showToast('info', 'Enrollment Rejected', 'The application has been rejected.');
    setShowReviewModal(false);
    setIsSubmitting(false);
  };

  const handleRequestCorrection = () => {
    if (!selectedApp || !correctionNotes.trim()) {
      showToast('warning', 'Notes Required', 'Please provide correction notes.');
      return;
    }
    setIsSubmitting(true);

    setApplications((prev) =>
      prev.map((a) =>
        a.id === selectedApp.id
          ? {
              ...a,
              status: 'needs_correction',
              notes: correctionNotes,
              reviewed_at: new Date().toISOString(),
            }
          : a
      )
    );

    showToast('success', 'Correction Requested', 'Student has been notified.');
    setShowCorrectionModal(false);
    setCorrectionNotes('');
    setIsSubmitting(false);
  };

  const handleCopyCredentials = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(
      `Email: ${credentials.email}\nStudent Number: ${credentials.studentNumber}\nPassword: ${credentials.password}`
    );
    showToast('success', 'Copied', 'Credentials copied to clipboard.');
  };

  const handleReset = () => {
    resetApplications();
    showToast('info', 'Applications Reset', 'Restored to default mock data.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Enrollment Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Review and manage student enrollment applications
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleReset} variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />}>
            Reset
          </Button>
          <Button
            onClick={() => navigate('/admin/sent-emails')}
            variant="outline"
            leftIcon={<Mail className="w-4 h-4" />}
          >
            Sent Emails
          </Button>
          <Button
            onClick={() => showToast('info', 'Refreshed', 'Application list updated.')}
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileCheck} label="Total Applications" value={stats.total} color="bg-cyan-50 text-cyan-600" />
        <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="bg-amber-50 text-amber-600" borderColor="border-amber-200" />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} color="bg-emerald-50 text-emerald-600" borderColor="border-emerald-200" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="bg-red-50 text-red-600" borderColor="border-red-200" />
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const count =
            tab.key === 'all'
              ? applications.length
              : applications.filter((a) => a.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterStatus === tab.key
                  ? `${tab.color} text-white shadow-md`
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      <Card noPadding>
        <div className="p-5 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by application #, student name, or email..."
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No applications found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters or search term'
                : 'Applications will appear here once students submit them.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">App #</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Section</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Courses</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 font-mono">{app.application_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {app.student?.first_name} {app.student?.last_name}
                      </div>
                      <div className="text-xs text-slate-400">{app.student?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{app.section?.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{app.section?.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{app.courses?.length || 0} subjects</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)}`}>
                        {getStatusLabel(app.status).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {app.submitted_at
                        ? new Date(app.submitted_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openReview(app)}
                          className="px-3 py-1.5 text-xs font-semibold text-navy bg-navy/10 rounded-lg hover:bg-navy/20 transition-colors"
                        >
                          Review
                        </button>
                        {(app.status === 'submitted' || app.status === 'under_review') && (
                          <button
                            onClick={() => openCorrection(app)}
                            className="px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                          >
                            Request Correction
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* REVIEW MODAL */}
      <Modal isOpen={showReviewModal && !!selectedApp} onClose={() => setShowReviewModal(false)} maxWidth="max-w-2xl">
        <div className="relative px-6 py-5 bg-gradient-to-r from-navy to-navy-dark">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">Review Application</h3>
              <p className="text-xs text-white/70 mt-0.5 font-mono">{selectedApp?.application_number}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Student</p>
              <p className="text-sm font-bold text-slate-900">
                {selectedApp?.student?.first_name} {selectedApp?.student?.last_name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{selectedApp?.student?.email}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Section</p>
              <p className="text-sm font-bold text-slate-900">{selectedApp?.section?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">{selectedApp?.section?.code}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Enrollment Type</p>
              <p className="text-sm font-bold text-slate-900 capitalize">{selectedApp?.enrollment_type}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${selectedApp && getStatusBadge(selectedApp.status)}`}>
                {selectedApp && getStatusLabel(selectedApp.status).toUpperCase()}
              </span>
            </div>
          </div>

          {selectedApp && selectedApp.courses && selectedApp.courses.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Courses ({selectedApp.courses.length})
              </p>
              <div className="space-y-2">
                {selectedApp.courses.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="w-9 h-9 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {c.subject.code} — {c.subject.name}
                      </p>
                      <p className="text-xs text-slate-500">{c.subject.units} units · {c.subject.subject_type}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-sm font-bold text-slate-700">Total Units</span>
                  <span className="text-lg font-bold text-navy">
                    {selectedApp.courses.reduce((sum, c) => sum + c.subject.units, 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedApp?.notes && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-amber-900">{selectedApp.notes}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-3">
          {(selectedApp?.status === 'submitted' || selectedApp?.status === 'under_review') && (
            <>
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1 min-w-[140px] py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Approve
              </button>
              <button
                onClick={handleReject}
                disabled={isSubmitting}
                className="flex-1 min-w-[140px] py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Reject
              </button>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  if (selectedApp) openCorrection(selectedApp);
                }}
                className="flex-1 min-w-[140px] py-3 bg-white border-2 border-orange-200 text-orange-700 text-sm font-semibold rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Request Correction
              </button>
            </>
          )}
          <button
            onClick={() => setShowReviewModal(false)}
            className="flex-1 min-w-[100px] py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* CORRECTION MODAL */}
      <Modal isOpen={showCorrectionModal && !!selectedApp} onClose={() => setShowCorrectionModal(false)} maxWidth="max-w-md">
        <div className="relative px-6 py-5 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">Request Correction</h3>
              <p className="text-xs text-white/80 mt-0.5">Send notes to the student</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Provide notes to the student about what needs to be corrected.
          </p>
          <textarea
            value={correctionNotes}
            onChange={(e) => setCorrectionNotes(e.target.value)}
            placeholder="Enter correction notes..."
            rows={5}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange/10 focus:border-orange-500 transition-all resize-none text-sm"
          />
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={() => setShowCorrectionModal(false)}
            className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRequestCorrection}
            disabled={isSubmitting || !correctionNotes.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            Send Request
          </button>
        </div>
      </Modal>

      {/* CREDENTIALS MODAL */}
      <Modal isOpen={showCredentialsModal && !!credentials} onClose={() => setShowCredentialsModal(false)} maxWidth="max-w-md">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-5 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Enrollment Approved</h3>
          <p className="text-sm text-white/90 mt-1">Credentials ready for the student</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student Number</p>
            <p className="text-2xl font-bold text-navy font-mono tracking-wider">
              {credentials?.studentNumber}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">📧 Email</p>
              <p className="text-sm font-medium text-slate-900 break-all">{credentials?.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">🔑 Password</p>
              <code className="inline-block bg-navy text-cyan-300 px-3 py-1.5 rounded-lg text-sm font-bold font-mono tracking-wider">
                {credentials?.password}
              </code>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-xs text-amber-800">
            ⚠️ Save this information — you may need it if the student contacts you.
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleCopyCredentials}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button
            onClick={() => setShowCredentialsModal(false)}
            className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EnrollmentReview;