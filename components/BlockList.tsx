import React from 'react';
import { QuietBlock } from '../types';
import TrashIcon from './icons/TrashIcon';

interface BlockListProps {
  blocks: QuietBlock[];
  deleteBlock: (id: string) => void;
}

const BlockList: React.FC<BlockListProps> = ({ blocks, deleteBlock }) => {
  const now = new Date();
  const upcomingBlocks = blocks.filter(b => new Date(b.end_time) > now);
  const pastBlocks = blocks.filter(b => new Date(b.end_time) <= now);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-3">Scheduled Blocks</h2>
      
      <h3 className="text-lg font-medium text-slate-600 mt-4 mb-2">Upcoming</h3>
      {upcomingBlocks.length > 0 ? (
        <ul className="space-y-3">
          {upcomingBlocks.map(block => (
            <li key={block.id} className="flex items-center justify-between bg-brand-light p-4 rounded-md shadow-sm transition-transform hover:scale-[1.02]">
              <div>
                <p className="font-semibold text-brand-dark">{formatDate(block.start_time)}</p>
                <p className="text-sm text-brand-dark opacity-90">{formatTime(block.start_time)} - {formatTime(block.end_time)}</p>
              </div>
              <button 
                onClick={() => deleteBlock(block.id)} 
                className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors duration-200"
                aria-label="Delete block"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500 italic">No upcoming quiet hours scheduled.</p>
      )}

      <h3 className="text-lg font-medium text-slate-600 mt-6 mb-2">Past</h3>
      {pastBlocks.length > 0 ? (
        <ul className="space-y-3">
          {pastBlocks.map(block => (
            <li key={block.id} className="flex items-center justify-between bg-slate-200 p-4 rounded-md opacity-70">
              <div>
                <p className="font-semibold text-slate-600 line-through">{formatDate(block.start_time)}</p>
                <p className="text-sm text-slate-600 line-through">{formatTime(block.start_time)} - {formatTime(block.end_time)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500 italic">No past quiet hours.</p>
      )}
    </div>
  );
};

export default BlockList;
