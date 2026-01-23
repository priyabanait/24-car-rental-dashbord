import React from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';

export default function ApprovalsUsers() {
  const columns = [
    { key: 'type', header: 'Type' },
    { key: 'name', header: 'Name' },
    { key: 'flat', header: 'Flat' },
    { key: 'requestedOn', header: 'Requested On' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions' },
  ];

  const data = [
    {
      id: 1,
      type: 'Resident',
      name: 'Rahul Mehta',
      flat: 'C-305',
      requestedOn: '21 Jan 2026',
      status: 'Pending',
      actions: 'Approve / Reject',
    },
    {
      id: 2,
      type: 'Security',
      name: 'Gate 1 Guard',
      flat: '-',
      requestedOn: '20 Jan 2026',
      status: 'Approved',
      actions: 'View',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Residents & Security Approvals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve new residents, security staff, and profile change requests.
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search requests..."
            className="input flex-1 min-w-[220px]"
          />
          <select className="input">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

