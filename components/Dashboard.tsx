import React from 'react';
import { QuietBlock } from '../types';
import SchedulerForm from './SchedulerForm';
import BlockList from './BlockList';
import { supabase } from '../App';

interface DashboardProps {
  quietBlocks: QuietBlock[];
  addBlock: (block: Omit<QuietBlock, 'id' | 'user_id' | 'notified'>) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({ quietBlocks, addBlock, deleteBlock }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-brand-dark">Quiet Hours Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark transition-colors duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <SchedulerForm addBlock={addBlock} />
          </div>
          <div className="lg:col-span-2">
            <BlockList blocks={quietBlocks} deleteBlock={deleteBlock} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
