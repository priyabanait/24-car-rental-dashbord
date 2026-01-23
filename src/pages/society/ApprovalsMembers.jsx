import React from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';

export default function ApprovalsMembers() {
  const columns = [
    { key: 'category', header: 'Category' },
    { key: 'name', header: 'Name' },
    { key: 'flat', header: 'Flat' },
    { key: 'requestedOn', header: 'Requested On' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions' },
  ];

  const data = [
    {
      id: 1,
      category: 'Family Member',
      name: 'Ananya Mehta',
      flat: 'C-305',
      requestedOn: '21 Jan 2026',
      status: 'Pending',
      actions: 'Approve / Reject',
    },
    {
      id: 2,
      category: 'Vehicle',
      name: 'MH 12 AB 1234',
      flat: 'A-101',
      requestedOn: '19 Jan 2026',
      status: 'Approved',
      actions: 'View',
    },
    {
      id: 3,
      category: 'Maid',
      name: 'Savitri Bai',
      flat: 'B-204',
      requestedOn: '18 Jan 2026',
      status: 'Rejected',
      actions: 'View',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Family / Vehicles / Maids Approvals
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Approve family members, domestic staff, and vehicles linked to each flat.
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search approvals..."
            className="input flex-1 min-w-[220px]"
          />
          <select className="input">
            <option value="">All Categories</option>
            <option value="family">Family</option>
            <option value="vehicle">Vehicles</option>
            <option value="maid">Maids</option>
          </select>
        </div>

        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

