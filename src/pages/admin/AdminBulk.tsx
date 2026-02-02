import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const AdminBulk = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number } | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const requiredHeaders = ['name', 'address', 'contact_email', 'contact_phone'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

      const schools = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const school: Record<string, string> = {};
        headers.forEach((header, i) => {
          school[header] = values[i] || '';
        });
        return school;
      });

      let success = 0;
      let failed = 0;

      for (const school of schools) {
        const { error } = await supabase.from('schools').insert({
          name: school.name,
          address: school.address,
          contact_email: school.contact_email,
          contact_phone: school.contact_phone,
          description: school.description || null,
        });

        if (error) {
          failed++;
          console.error('Failed to insert school:', school.name, error);
        } else {
          success++;
        }
      }

      return { success, failed };
    },
    onSuccess: (result) => {
      setUploadStatus('success');
      setUploadResult(result);
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      toast({
        title: 'Upload Complete',
        description: `${result.success} schools added successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
      });
    },
    onError: (error: any) => {
      setUploadStatus('error');
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message,
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Please upload a CSV file',
      });
      return;
    }

    setUploadStatus('uploading');
    setUploadResult(null);
    uploadMutation.mutate(file);
  };

  const downloadTemplate = () => {
    const headers = ['name', 'address', 'contact_email', 'contact_phone', 'description'];
    const exampleRow = ['Example School', '123 Main St, City', 'school@example.com', '9876543210', 'A great school'];
    const csv = [headers.join(','), exampleRow.join(',')].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schools_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bulk Operations</h1>
          <p className="text-muted-foreground">Import and export data in bulk</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Schools
              </CardTitle>
              <CardDescription>
                Upload a CSV file to add multiple schools at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {uploadStatus === 'uploading' ? (
                  <>
                    <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : uploadStatus === 'success' ? (
                  <>
                    <CheckCircle className="mb-4 h-10 w-10 text-gsx-success" />
                    <p className="text-sm font-medium">Upload Complete!</p>
                    {uploadResult && (
                      <p className="text-sm text-muted-foreground">
                        {uploadResult.success} added, {uploadResult.failed} failed
                      </p>
                    )}
                  </>
                ) : uploadStatus === 'error' ? (
                  <>
                    <AlertCircle className="mb-4 h-10 w-10 text-destructive" />
                    <p className="text-sm font-medium">Upload Failed</p>
                    <p className="text-sm text-muted-foreground">Click to try again</p>
                  </>
                ) : (
                  <>
                    <FileText className="mb-4 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload CSV</p>
                    <p className="text-sm text-muted-foreground">or drag and drop</p>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={downloadTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle>CSV Format Guide</CardTitle>
              <CardDescription>
                Follow these instructions for successful import
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Required Columns:</h4>
                <ul className="list-inside list-disc text-sm text-muted-foreground space-y-1">
                  <li><code className="bg-muted px-1 rounded">name</code> - School name</li>
                  <li><code className="bg-muted px-1 rounded">address</code> - Full address</li>
                  <li><code className="bg-muted px-1 rounded">contact_email</code> - Email address</li>
                  <li><code className="bg-muted px-1 rounded">contact_phone</code> - Phone number</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Optional Columns:</h4>
                <ul className="list-inside list-disc text-sm text-muted-foreground space-y-1">
                  <li><code className="bg-muted px-1 rounded">description</code> - School description</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tips:</h4>
                <ul className="list-inside list-disc text-sm text-muted-foreground space-y-1">
                  <li>First row must contain column headers</li>
                  <li>Values should not contain commas (or wrap in quotes)</li>
                  <li>Save file as UTF-8 encoded CSV</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBulk;
