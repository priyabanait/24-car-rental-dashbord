import React from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';

export default function Directory() {
  const columns = [
    { key: 'flat', header: 'Flat' },
    { key: 'name', header: 'Primary Contact' },
    { key: 'phone', header: 'Phone' },
    { key: 'visibility', header: 'Visibility' },
  ];

  const data = [
    {
      id: 1,
      flat: 'A-101',
      name: 'John Doe',
      phone: '+91 98765 43210',
      visibility: 'Visible to residents',
    },
    {
      id: 2,
      flat: 'B-204',
      name: 'Priya Sharma',
      phone: 'Hidden',
      visibility: 'Hidden',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Directory Controls</h1>
          <p className="mt-1 text-sm text-gray-500">
            Control what information is visible in the resident directory and manage privacy.
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search by flat or name..."
            className="input flex-1 min-w-[220px]"
          />
          <select className="input">
            <option value="">All Visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

