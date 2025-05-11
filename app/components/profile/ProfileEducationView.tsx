import { useState, useEffect } from 'react';
import { School, BookOpen, Calendar } from 'lucide-react';

interface EducationEntry {
  id: number;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface ProfileEducationViewProps {
  userId: string;
}

export default function ProfileEducationView({ userId }: ProfileEducationViewProps) {
  const [educationList, setEducationList] = useState<EducationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEducationEntries();
  }, [userId]);

  const fetchEducationEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/education/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEducationList(data);
      } else {
        console.error('Failed to fetch education entries:', response.status);
        setError('Failed to load education data');
      }
    } catch (error) {
      console.error('Error fetching education entries:', error);
      setError('An error occurred while loading education data');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-16 bg-gray-200 rounded-md"></div>
        <div className="h-16 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">{error}</div>
    );
  }

  if (educationList.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        <School className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p>No education history found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {educationList.map((entry) => (
        <div key={entry.id} className="border-b pb-4 last:border-b-0">
          <div className="flex items-center">
            <School className="h-4 w-4 text-blue-500 mr-2" />
            <h4 className="font-medium">{entry.institution}</h4>
          </div>
          <div className="ml-6 text-sm text-gray-700 mt-1 flex items-center">
            <BookOpen className="h-3 w-3 mr-1" />
            <span className="font-medium">{entry.degree}</span>
            {entry.field_of_study && <span> in {entry.field_of_study}</span>}
          </div>
          {(entry.start_date || entry.end_date) && (
            <div className="ml-6 text-xs text-gray-500 mt-1 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(entry.start_date)} {entry.start_date && entry.end_date && ' - '} {formatDate(entry.end_date)}
            </div>
          )}
          {entry.description && (
            <div className="ml-6 text-xs text-gray-600 mt-2">
              {entry.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 