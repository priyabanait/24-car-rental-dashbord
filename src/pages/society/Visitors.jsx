import React from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';

export default function Visitors() {
  const columns = [
    { key: 'name', header: 'Visitor Name' },
    { key: 'flat', header: 'Visiting Flat' },
    { key: 'type', header: 'Type' },
    { key: 'inTime', header: 'In Time' },
    { key: 'outTime', header: 'Out Time' },
    { key: 'gate', header: 'Gate' },
  ];

  const data = [
    {
      id: 1,
      name: 'Delivery - Swiggy',
      flat: 'A-101',
      type: 'Delivery',
      inTime: '21 Jan 2026, 08:45 PM',
      outTime: '21 Jan 2026, 08:55 PM',
      gate: 'Main Gate',
    },
    {
      id: 2,
      name: 'Rohit Verma',
      flat: 'B-204',
      type: 'Guest',
      inTime: '21 Jan 2026, 07:15 PM',
      outTime: '-',
      gate: 'Side Gate',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Visitor & Event Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor visitor entries, exits, and event logs across all gates.
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search visitors..."
            className="input flex-1 min-w-[220px]"
          />
          <div className="flex gap-2">
            <select className="input">
              <option value="">All Types</option>
              <option value="guest">Guest</option>
              <option value="delivery">Delivery</option>
              <option value="staff">Staff</option>
            </select>
            <select className="input">
              <option value="">All Gates</option>
              <option value="main">Main Gate</option>
              <option value="side">Side Gate</option>
            </select>
          </div>
        </div>

        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

