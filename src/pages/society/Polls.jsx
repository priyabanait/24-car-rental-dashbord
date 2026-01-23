import React from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';

export default function Polls() {
  const columns = [
    { key: 'question', header: 'Poll Question' },
    { key: 'createdOn', header: 'Created On' },
    { key: 'status', header: 'Status' },
    { key: 'totalVotes', header: 'Total Votes' },
  ];

  const data = [
    {
      id: 1,
      question: 'Should we install CCTV in all lift lobbies?',
      createdOn: '15 Jan 2026',
      status: 'Active',
      totalVotes: 86,
    },
    {
      id: 2,
      question: 'Preferred timing for yoga classes?',
      createdOn: '10 Jan 2026',
      status: 'Closed',
      totalVotes: 42,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Polls & Results</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create polls for residents and review voting results for community decisions.
          </p>
        </div>
        <button className="btn btn-primary">
          New Poll
        </button>
      </div>

      <Card>
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

