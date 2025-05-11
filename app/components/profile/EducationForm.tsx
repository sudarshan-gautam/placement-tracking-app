import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, School, BookOpen, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface EducationEntry {
  id?: number;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface EducationFormProps {
  userId: string;
  onUpdate: () => void;
}

export default function EducationForm({ userId, onUpdate }: EducationFormProps) {
  const [educationList, setEducationList] = useState<EducationEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newEntry, setNewEntry] = useState<EducationEntry>({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  
  // Fetch existing education entries when component mounts
  useEffect(() => {
    fetchEducationEntries();
  }, [userId]);
  
  const fetchEducationEntries = async () => {
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
      }
    } catch (error) {
      console.error('Error fetching education entries:', error);
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
  
  const resetForm = () => {
    setNewEntry({
      institution: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      description: ''
    });
    setIsAdding(false);
    setEditIndex(null);
  };
  
  const handleAddEducation = async () => {
    try {
      // Validate required fields
      if (!newEntry.institution || !newEntry.degree) {
        toast({
          title: 'Missing Information',
          description: 'Institution and degree are required fields.',
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
      
      const response = await fetch(`/api/education/${userId}`, {
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
          description: 'Education entry added successfully'
        });
        resetForm();
        fetchEducationEntries();
        onUpdate();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to add education entry',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error adding education entry:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateEducation = async () => {
    try {
      if (editIndex === null || !educationList[editIndex]?.id) return;
      
      // Validate required fields
      if (!newEntry.institution || !newEntry.degree) {
        toast({
          title: 'Missing Information',
          description: 'Institution and degree are required fields.',
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
      
      const educationId = educationList[editIndex].id;
      const response = await fetch(`/api/education/${userId}/${educationId}`, {
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
          description: 'Education entry updated successfully'
        });
        resetForm();
        fetchEducationEntries();
        onUpdate();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update education entry',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating education entry:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteEducation = async (id: number) => {
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
      
      const response = await fetch(`/api/education/${userId}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Education entry deleted successfully'
        });
        fetchEducationEntries();
        onUpdate();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to delete education entry',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting education entry:', error);
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
    setNewEntry(educationList[index]);
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
        <h3 className="text-lg font-medium">Education</h3>
        {!isAdding && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAdding(true)}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Education
          </Button>
        )}
      </div>
      
      {/* List of education entries */}
      {educationList.length > 0 ? (
        <div className="space-y-3">
          {educationList.map((entry, index) => (
            <div key={entry.id} className="border rounded-lg p-3 relative bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
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
                    onClick={() => handleDeleteEducation(entry.id!)}
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
          <School className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p>No education entries added yet</p>
        </div>
      )}
      
      {/* Form for adding/editing education */}
      {isAdding && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-3">
            {editIndex !== null ? 'Edit Education' : 'Add Education'}
          </h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input 
                id="institution"
                name="institution"
                value={newEntry.institution}
                onChange={handleInputChange}
                placeholder="University or School Name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="degree">Degree</Label>
              <Input 
                id="degree"
                name="degree"
                value={newEntry.degree}
                onChange={handleInputChange}
                placeholder="Degree or Certificate"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="field_of_study">Field of Study</Label>
              <Input 
                id="field_of_study"
                name="field_of_study"
                value={newEntry.field_of_study}
                onChange={handleInputChange}
                placeholder="Major or Specialization"
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
              
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input 
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={newEntry.end_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                value={newEntry.description}
                onChange={handleInputChange}
                placeholder="Achievements, activities, etc."
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
                onClick={editIndex !== null ? handleUpdateEducation : handleAddEducation}
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