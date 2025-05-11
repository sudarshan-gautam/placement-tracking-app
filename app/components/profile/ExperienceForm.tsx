import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Briefcase, Building, MapPin, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ExperienceEntry {
  id?: string;
  company: string;
  title: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
  description?: string;
}

interface ExperienceFormProps {
  userId: string;
  onUpdate: () => void;
}

export default function ExperienceForm({ userId, onUpdate }: ExperienceFormProps) {
  const [experienceList, setExperienceList] = useState<ExperienceEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newEntry, setNewEntry] = useState<ExperienceEntry>({
    company: '',
    title: '',
    location: '',
    start_date: '',
    end_date: '',
    current: false,
    description: ''
  });
  
  // Fetch existing experience entries when component mounts
  useEffect(() => {
    fetchExperienceEntries();
  }, [userId]);
  
  const fetchExperienceEntries = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Authentication token is missing. Please log in again.',
          variant: 'destructive'
        });
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
      }
    } catch (error) {
      console.error('Error fetching experience entries:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setNewEntry(prev => ({
      ...prev,
      current: checked,
      end_date: checked ? '' : prev.end_date
    }));
  };
  
  const resetForm = () => {
    setNewEntry({
      company: '',
      title: '',
      location: '',
      start_date: '',
      end_date: '',
      current: false,
      description: ''
    });
    setIsAdding(false);
    setEditIndex(null);
  };
  
  const handleAddExperience = async () => {
    try {
      // Validate required fields
      if (!newEntry.company || !newEntry.title) {
        toast({
          title: 'Missing Information',
          description: 'Company and title are required fields.',
          variant: 'destructive'
        });
        return;
      }
      
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Authentication token is missing. Please log in again.',
          variant: 'destructive'
        });
        return;
      }
      
      const response = await fetch(`/api/experience/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEntry)
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Experience entry added successfully'
        });
        resetForm();
        fetchExperienceEntries();
        onUpdate();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to add experience entry',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error adding experience entry:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateExperience = async () => {
    try {
      if (editIndex === null || !experienceList[editIndex]?.id) return;
      
      // Validate required fields
      if (!newEntry.company || !newEntry.title) {
        toast({
          title: 'Missing Information',
          description: 'Company and title are required fields.',
          variant: 'destructive'
        });
        return;
      }
      
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Authentication token is missing. Please log in again.',
          variant: 'destructive'
        });
        return;
      }
      
      const experienceId = experienceList[editIndex].id;
      const response = await fetch(`/api/experience/${userId}/${experienceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEntry)
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Experience entry updated successfully'
        });
        resetForm();
        fetchExperienceEntries();
        onUpdate();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update experience entry',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating experience entry:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteExperience = async (id: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Authentication token is missing. Please log in again.',
          variant: 'destructive'
        });
        return;
      }
      
      const response = await fetch(`/api/experience/${userId}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Experience entry deleted successfully'
        });
        fetchExperienceEntries();
        onUpdate();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to delete experience entry',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting experience entry:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setNewEntry(experienceList[index]);
    setIsAdding(true);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Work Experience</h3>
        {!isAdding && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAdding(true)}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Experience
          </Button>
        )}
      </div>
      
      {/* List of experience entries */}
      {experienceList.length > 0 ? (
        <div className="space-y-3">
          {experienceList.map((entry, index) => (
            <div key={entry.id} className="border rounded-lg p-3 relative bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
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
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(index)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExperience(entry.id!)}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 border border-dashed rounded-lg">
          <Briefcase className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p>No work experience entries added yet</p>
        </div>
      )}
      
      {/* Form for adding/editing experience */}
      {isAdding && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-3">
            {editIndex !== null ? 'Edit Experience' : 'Add Experience'}
          </h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company"
                name="company"
                value={newEntry.company}
                onChange={handleInputChange}
                placeholder="Company Name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                name="title"
                value={newEntry.title}
                onChange={handleInputChange}
                placeholder="Job Title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location"
                name="location"
                value={newEntry.location}
                onChange={handleInputChange}
                placeholder="City, Country or Remote"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input 
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={newEntry.start_date}
                  onChange={handleInputChange}
                />
              </div>
              
              {!newEntry.current && (
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input 
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={newEntry.end_date}
                    onChange={handleInputChange}
                    disabled={newEntry.current}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="current" 
                checked={newEntry.current} 
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="current">I currently work here</Label>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                value={newEntry.description}
                onChange={handleInputChange}
                placeholder="Responsibilities, achievements, etc."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={editIndex !== null ? handleUpdateExperience : handleAddExperience}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (editIndex !== null ? 'Update' : 'Add')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 