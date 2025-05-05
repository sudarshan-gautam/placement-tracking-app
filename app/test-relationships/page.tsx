'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TestRelationshipsPage() {
  const [relationships, setRelationships] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch relationships
    fetch('/api/test-relationships')
      .then(res => res.json())
      .then(data => {
        setRelationships(data.relationships);
        setActivities(data.activities);
      })
      .catch(err => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Test Relationships</h1>

      {/* Mentor-Student Relationships */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Mentor-Student Relationships</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {relationships.map((rel) => (
              <div key={rel.id} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">Mentor: {rel.mentor_name}</p>
                <p className="text-sm text-gray-600">Student: {rel.student_name}</p>
                <p className="text-sm text-gray-500">Assigned: {new Date(rel.assigned_date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Student Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <p className="font-medium">{activity.title}</p>
                  <span className={`px-2 py-1 rounded text-sm ${
                    activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                    activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Student: {activity.student_name}</p>
                <p className="text-sm text-gray-600">Type: {activity.activity_type}</p>
                <p className="text-sm text-gray-500">Completed: {new Date(activity.date_completed).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 