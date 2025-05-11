import { useState, useEffect } from 'react';
import { Briefcase, Building, MapPin, Calendar } from 'lucide-react';

interface ExperienceEntry {
  id: string;
  user_id: string;
  title: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  current: boolean;
  description?: string;
}

interface ProfileExperienceViewProps {
  userId: string;
}

export default function ProfileExperienceView({ userId }: ProfileExperienceViewProps) {
  const [experienceList, setExperienceList] = useState<ExperienceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExperienceEntries();
  }, [userId]);

  const fetchExperienceEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/experience/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExperienceList(data);
      } else {
        console.error('Failed to fetch experience entries:', response.status);
        setError('Failed to load experience data');
      }
    } catch (error) {
      console.error('Error fetching experience entries:', error);
      setError('An error occurred while loading experience data');
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

  if (experienceList.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        <Briefcase className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p>No work experience found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {experienceList.map((entry) => (
        <div key={entry.id} className="border-b pb-4 last:border-b-0">
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 text-blue-500 mr-2" />
            <h4 className="font-medium">{entry.title}</h4>
            {entry.current && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Current
              </span>
            )}
          </div>
          <div className="ml-6 text-sm text-gray-700 mt-1 flex items-center">
            <Building className="h-3 w-3 mr-1" />
            <span>{entry.company}</span>
          </div>
          {entry.location && (
            <div className="ml-6 text-xs text-gray-500 mt-1 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{entry.location}</span>
            </div>
          )}
          {(entry.start_date || entry.end_date) && (
            <div className="ml-6 text-xs text-gray-500 mt-1 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(entry.start_date)} {entry.start_date && (entry.end_date ? ' - ' + formatDate(entry.end_date) : ' - Present')}
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