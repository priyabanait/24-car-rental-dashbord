import React from 'react';
import Card from '../../components/ui/Card';

export default function Announcements() {
  const announcements = [
    {
      id: 1,
      title: 'Annual General Meeting (AGM)',
      date: '25 Jan 2026',
      createdBy: 'Society Admin',
      category: 'Meeting',
      content: 'AGM will be held at the clubhouse at 5:00 PM. All residents are requested to attend.',
    },
    {
      id: 2,
      title: 'Water Tank Cleaning',
      date: '23 Jan 2026',
      createdBy: 'Maintenance Team',
      category: 'Maintenance',
      content: 'Water supply will be unavailable from 10:00 AM to 2:00 PM due to tank cleaning.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Announcements & Wall</h1>
          <p className="mt-1 text-sm text-gray-500">
            Post important society announcements and broadcast updates to all residents.
          </p>
        </div>
        <button className="btn btn-primary">
          New Announcement
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {announcements.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                <p className="mt-1 text-sm text-gray-600">{item.content}</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                {item.category}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>Posted by {item.createdBy}</span>
              <span>{item.date}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

