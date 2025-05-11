'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Calendar, Building, FileText, Save, Upload, X } from 'lucide-react';
import { QualificationType, QualificationFormData } from '@/types/qualification';
import { toast } from '@/components/ui/use-toast';

interface QualificationFormProps {
  userId: string;
  qualificationId?: string;
  initialData?: QualificationFormData;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export default function QualificationForm({
  userId,
  qualificationId,
  initialData,
  onSuccess,
  onCancel
}: QualificationFormProps) {
  // Form state
  const [formData, setFormData] = useState<QualificationFormData>({
    title: '',
    issuing_organization: '',
    description: '',
    date_obtained: '',
    expiry_date: '',
    type: 'certificate' as QualificationType,
    certificate_file: undefined
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Certificate file state
  const [certificate, setCertificate] = useState<File | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null);
  
  // Load initial data if provided (edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        certificate_file: undefined // Clear certificate file on edit
      });
    }
  }, [initialData]);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select field changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle certificate file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF or image file (JPEG, PNG)',
          variant: 'destructive'
        });
        return;
      }
      
      // Check file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'File size must be less than 10MB',
          variant: 'destructive'
        });
        return;
      }
      
      // Set the file in state
      setCertificate(file);
      setFormData((prev) => ({ ...prev, certificate_file: file }));
      
      // Create a preview if it's an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setCertificatePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs, just show the filename
        setCertificatePreview(null);
      }
    }
  };

  // Clear the selected certificate
  const clearCertificate = () => {
    setCertificate(null);
    setCertificatePreview(null);
    setFormData((prev) => ({ ...prev, certificate_file: undefined }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate required fields
      if (!formData.title || !formData.issuing_organization || !formData.date_obtained || !formData.type) {
        toast({
          title: 'Missing information',
          description: 'Please fill out all required fields',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
      
      // If we're adding a new qualification without a certificate
      if (!qualificationId && !certificate) {
        // Create the qualification first
        const response = await fetch(`/api/student/${userId}/qualifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to create qualification');
        }
        
        const createdQualification = await response.json();
        
        toast({
          title: 'Success',
          description: 'Qualification added successfully'
        });
        
        if (onSuccess) {
          onSuccess(createdQualification);
        }
      }
      // If we're updating an existing qualification without changing the certificate
      else if (qualificationId && !certificate) {
        // Update the qualification without certificate
        const response = await fetch(`/api/student/${userId}/qualifications`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: qualificationId,
            ...formData
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update qualification');
        }
        
        const updatedQualification = await response.json();
        
        toast({
          title: 'Success',
          description: 'Qualification updated successfully'
        });
        
        if (onSuccess) {
          onSuccess(updatedQualification);
        }
      }
      // If we have a certificate file to upload
      else if (certificate) {
        // If we're updating, first update the qualification data
        if (qualificationId) {
          const updateResponse = await fetch(`/api/student/${userId}/qualifications`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: qualificationId,
              ...formData,
              certificate_url: null // Will be set by the upload endpoint
            })
          });
          
          if (!updateResponse.ok) {
            throw new Error('Failed to update qualification data');
          }
        }
        
        // If we're adding new, first create the qualification
        let qualId = qualificationId;
        if (!qualId) {
          const createResponse = await fetch(`/api/student/${userId}/qualifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...formData,
              certificate_url: null // Will be set by the upload endpoint
            })
          });
          
          if (!createResponse.ok) {
            throw new Error('Failed to create qualification');
          }
          
          const createdQual = await createResponse.json();
          qualId = createdQual.id;
        }
        
        // Now upload the certificate
        const formDataObj = new FormData();
        formDataObj.append('certificate', certificate);
        formDataObj.append('qualificationId', qualId!);
        
        const uploadResponse = await fetch(`/api/student/${userId}/qualifications/certificate`, {
          method: 'POST',
          body: formDataObj
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload certificate');
        }
        
        const uploadResult = await uploadResponse.json();
        
        toast({
          title: 'Success',
          description: qualificationId 
            ? 'Qualification updated successfully' 
            : 'Qualification added successfully'
        });
        
        if (onSuccess) {
          onSuccess(uploadResult.qualification);
        }
      }
      
      // Reset form if not canceled
      if (!onCancel) {
        setFormData({
          title: '',
          issuing_organization: '',
          description: '',
          date_obtained: '',
          expiry_date: '',
          type: 'certificate',
          certificate_file: undefined
        });
        setCertificate(null);
        setCertificatePreview(null);
      }
      
    } catch (error) {
      console.error('Error submitting qualification:', error);
      toast({
        title: 'Error',
        description: 'Failed to save qualification. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          {qualificationId ? 'Edit Qualification' : 'Add New Qualification'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Bachelor of Education, Teaching Certificate"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuing_organization">
              Issuing Organization <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-400" />
              <Input
                id="issuing_organization"
                name="issuing_organization"
                value={formData.issuing_organization}
                onChange={handleChange}
                placeholder="e.g., University of London, Red Cross"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_obtained">
                Date Obtained <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  id="date_obtained"
                  name="date_obtained"
                  type="date"
                  value={formData.date_obtained}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">
                Expiry Date <span className="text-gray-500">(if applicable)</span>
              </Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  id="expiry_date"
                  name="expiry_date"
                  type="date"
                  value={formData.expiry_date || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleSelectChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="degree">Degree</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="license">License</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 mt-2 text-gray-400" />
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Provide details about this qualification"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificate">Certificate Upload</Label>
            <div className="border border-dashed border-gray-300 rounded-md p-4">
              {!certificate ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    Drag and drop your certificate, or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Accepted formats: PDF, PNG, JPEG (max 10MB)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('certificate_file')?.click()}
                  >
                    Select File
                  </Button>
                  <input
                    id="certificate_file"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{certificate.name}</p>
                      <p className="text-xs text-gray-500">
                        {(certificate.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearCertificate}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {certificatePreview && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={certificatePreview}
                    alt="Certificate preview"
                    className="max-h-48 max-w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⟳</span> Saving...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {qualificationId ? 'Update' : 'Save'} Qualification
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 