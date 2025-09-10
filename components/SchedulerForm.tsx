import React, { useState } from 'react';
import { QuietBlock } from '../types';
import CalendarIcon from './icons/CalendarIcon';
import ClockIcon from './icons/ClockIcon';

interface SchedulerFormProps {
  addBlock: (block: Omit<QuietBlock, 'id' | 'user_id' | 'notified'>) => Promise<void>;
}

const SchedulerForm: React.FC<SchedulerFormProps> = ({ addBlock }) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date || !startTime || !endTime) {
      setError('All fields are required.');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (endDateTime <= startDateTime) {
      setError('End time must be after start time.');
      return;
    }

    if (startDateTime < new Date()) {
        setError('Cannot schedule a block in the past.');
        return;
    }
    
    setLoading(true);
    try {
      await addBlock({
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      });
      // Reset form on success
      setDate('');
      setStartTime('');
      setEndTime('');
    } catch (apiError: any) {
      // Error is displayed via Notification in App.tsx
      console.error(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-3">Schedule New Block</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-600 mb-1">Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
              disabled={loading}
            />
          </div>
        </div>
        <div>
          <label htmlFor="start-time" className="block text-sm font-medium text-slate-600 mb-1">Start Time</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ClockIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="time"
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
              disabled={loading}
            />
          </div>
        </div>
        <div>
          <label htmlFor="end-time" className="block text-sm font-medium text-slate-600 mb-1">End Time</label>
           <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ClockIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="time"
              id="end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
              disabled={loading}
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark transition-colors duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Block'}
        </button>
      </form>
    </div>
  );
};

export default SchedulerForm;
