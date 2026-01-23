import React from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';

export default function Maintenance() {
  const columns = [
    { key: 'month', header: 'Month' },
    { key: 'totalBilled', header: 'Total Billed' },
    { key: 'totalCollected', header: 'Total Collected' },
    { key: 'pending', header: 'Pending' },
    { key: 'collectionRate', header: 'Collection Rate' },
  ];

  const data = [
    {
      id: 1,
      month: 'January 2026',
      totalBilled: '₹ 4,50,000',
      totalCollected: '₹ 4,10,000',
      pending: '₹ 40,000',
      collectionRate: '91%',
    },
    {
      id: 2,
      month: 'December 2025',
      totalBilled: '₹ 4,50,000',
      totalCollected: '₹ 4,45,000',
      pending: '₹ 5,000',
      collectionRate: '99%',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Maintenance Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track monthly maintenance billing, collections, and pending amounts.
          </p>
        </div>
        <button className="btn btn-outline">
          Export Report
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-gray-500">Current Month Billed</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">₹ 4,50,000</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Current Month Collected</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">₹ 4,10,000</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Pending Dues</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">₹ 40,000</p>
        </Card>
      </div>

      <Card>
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}

