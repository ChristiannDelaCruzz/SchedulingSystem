// src/pages/System/Settings.tsx
import React from 'react';
import { Settings as SettingsIcon, Trash2, Database } from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import { useToast } from '../../hooks/useToast';

export const Settings: React.FC = () => {
  const { showToast } = useToast();

  const keys = [
    'smart_sched_rooms',
    'smart_sched_sections',
    'smart_sched_subjects',
    'smart_sched_professors',
    'smart_sched_qualifications',
    'smart_sched_enrollments',
  ];

  const handleClear = () => {
    for (const k of keys) localStorage.removeItem(k);
    showToast('success', 'Cache Cleared', 'Reload the page to restore defaults.');
  };

  const handleInspect = () => {
    const found = keys.filter((k) => localStorage.getItem(k) !== null);
    showToast('info', 'Cached Keys', found.length === 0 ? 'None' : found.join(', '));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Manage cached data and system preferences.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900">Local Data Cache</h2>
            <p className="text-sm text-slate-500 mt-1">
              Edits to Rooms, Sections, Subjects, Professors, and Enrollments are stored in your
              browser's localStorage so they persist across page refreshes. Clear them to reset
              back to the default mock data.
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              <Button onClick={handleInspect} variant="outline">
                Inspect Cache
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Clear Cache
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-navy/10 text-navy flex items-center justify-center flex-shrink-0">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900">More Settings</h2>
            <p className="text-sm text-slate-500 mt-1">
              Additional system settings will be available here in a future update.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;