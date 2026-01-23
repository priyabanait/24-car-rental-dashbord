import React from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';

export default function Helpdesk() {
  const columns = [
    { key: 'ticket', header: 'Ticket ID' },
    { key: 'flat', header: 'Flat' },
    { key: 'subject', header: 'Subject' },
    { key: 'category', header: 'Category' },
    { key: 'createdOn', header: 'Created On' },
    { key: 'status', header: 'Status' },
  ];

  const data = [
    {
      id: 1,
      ticket: '#HDK-1001',
      flat: 'A-101',
      subject: 'Water leakage in kitchen',
      category: 'Plumbing',
      createdOn: '21 Jan 2026',
      status: 'Open',
    },
    {
      id: 2,
      ticket: '#HDK-1002',
      flat: 'B-204',
      subject: 'Lift not working',
      category: 'Maintenance',
      createdOn: '20 Jan 2026',
      status: 'In Progress',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Helpdesk</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage complaints and service requests raised by residents.
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search tickets..."
            className="input flex-1 min-w-[220px]"
          />
          <select className="input">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

