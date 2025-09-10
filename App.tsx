import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { QuietBlock, NotificationMessage } from './types';
import Notification from './components/Notification';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';

// --- Supabase Client Initialization ---
// IMPORTANT: You must replace these placeholder values with your actual Supabase credentials.
// 1. Go to your Supabase project dashboard.
// 2. Navigate to Project Settings > API.
// 3. Find your Project URL and anon Public key.
// 4. Replace the placeholder strings below.
const SUPABASE_URL = "YOUR_SUPABASE_URL"; // e.g., "https://xyzabc.supabase.co"
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"; // e.g., "eyJh..."

const credentialsMissing = SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client.
// We use a temp object if credentials are missing to prevent an immediate crash,
// the app component will render a warning instead.
export const supabase: SupabaseClient = credentialsMissing 
  ? {} as SupabaseClient 
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ---

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [quietBlocks, setQuietBlocks] = useState<QuietBlock[]>([]);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Configuration Check ---
  if (credentialsMissing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 text-slate-800">
        <div className="w-full max-w-2xl p-8 space-y-4 bg-white rounded-xl shadow-2xl text-center">
          <h1 className="text-2xl font-bold text-red-600">Configuration Needed</h1>
          <p className="text-slate-600 leading-relaxed">
            You need to configure your Supabase credentials. Please open the
            <code className="bg-slate-200 text-red-700 font-mono p-1 rounded-md mx-1">App.tsx</code>
            file and replace the placeholder values for
            <code className="bg-slate-200 text-red-700 font-mono p-1 rounded-md mx-1">SUPABASE_URL</code>
            and
            <code className="bg-slate-200 text-red-700 font-mono p-1 rounded-md mx-1">SUPABASE_ANON_KEY</code>
            with your actual Supabase project credentials.
          </p>
        </div>
      </div>
    );
  }

  // --- Auth Management ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Data Fetching ---
  const fetchBlocks = useCallback(async () => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from('quiet_blocks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('start_time', { ascending: true });

    if (error) {
      addNotification(`Error fetching blocks: ${error.message}`, 'error');
    } else {
      setQuietBlocks(data || []);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchBlocks();
    }
  }, [session, fetchBlocks]);
  
  // --- Notification Logic ---
  const addNotification = useCallback((message: string, type: NotificationMessage['type'] = 'info') => {
    const newNotification: NotificationMessage = {
      id: Date.now(),
      message,
      type,
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

      setQuietBlocks(prevBlocks =>
        prevBlocks.map(block => {
          const startTime = new Date(block.start_time);
          if (!block.notified && startTime > now && startTime <= tenMinutesFromNow) {
            const timeString = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            addNotification(`Your quiet hours block is starting at ${timeString}!`);
            // In a real app, you might update the 'notified' status in the DB here.
            return { ...block, notified: true };
          }
          return block;
        })
      );
    }, 30000);

    return () => clearInterval(interval);
  }, [addNotification]);

  // --- CRUD Operations ---
  const addBlock = async (block: Omit<QuietBlock, 'id' | 'user_id' | 'notified'>) => {
    if (!session?.user) {
      addNotification('You must be logged in to add a block.', 'error');
      return;
    }
    const { data, error } = await supabase
      .from('quiet_blocks')
      .insert({ ...block, user_id: session.user.id, notified: false })
      .select()
      .single();

    if (error) {
      addNotification(`Error adding block: ${error.message}`, 'error');
      throw new Error(error.message);
    }
    if (data) {
      setQuietBlocks(prev => [...prev, data].sort((a,b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()));
      addNotification('Block scheduled successfully!', 'success');
    }
  };

  const deleteBlock = async (id: string) => {
    const { error } = await supabase
      .from('quiet_blocks')
      .delete()
      .eq('id', id);

    if (error) {
      addNotification(`Error deleting block: ${error.message}`, 'error');
    } else {
      setQuietBlocks(prev => prev.filter(block => block.id !== id));
      addNotification('Block deleted.', 'success');
    }
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {session ? (
        <Dashboard
          quietBlocks={quietBlocks}
          addBlock={addBlock}
          deleteBlock={deleteBlock}
        />
      ) : (
        <Login />
      )}
      <div className="fixed top-5 right-5 z-50 w-full max-w-sm space-y-3">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onDismiss={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
