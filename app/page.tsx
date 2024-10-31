
 'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileText, Mail, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PdfData {
  [driverName: string]: string;
}

const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfData, setPdfData] = useState<PdfData>({});
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const handleFileChange = (e: any) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
      } else {
        setError('Please upload a valid Excel (.xlsx) file.');
      }
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please upload a CSV file.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:5000/process_excel/', {
        method: 'POST',
        body: formData,
        credentials: 'omit',
      });

      const result = await res.json();
      if (res.ok) {
        setPdfData(result.pdfs);
        setStep('preview');
        setCurrentPreviewIndex(0);
      } else {
        setError(result.error || 'An error occurred while processing the file.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing the file.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:5000/send_email/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ pdfs: pdfData }),
        credentials: 'omit',
      });

      const result = await res.json();
      if (res.ok) {
        setStep('upload');
        setPdfData({});
        setFile(null);
        setError('success:' + result.message);
      } else {
        setError(result.error || 'An error occurred while sending emails.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while sending emails.');
    } finally {
      setLoading(false);
    }
  };

  const driverNames = Object.keys(pdfData);
  const totalPdfs = driverNames.length;

  const PreviewNavigation = () => (
    <div className="flex items-center justify-between mb-4 bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPreviewIndex(prev => Math.max(0, prev - 1))}
          disabled={currentPreviewIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          PDF {currentPreviewIndex + 1} of {totalPdfs}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPreviewIndex(prev => Math.min(totalPdfs - 1, prev + 1))}
          disabled={currentPreviewIndex === totalPdfs - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-sm font-medium text-gray-600">
        Driver: {driverNames[currentPreviewIndex]}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {step === 'upload' ? (
              <>
                <FileText className="h-6 w-6" />
                Paystub Generator
              </>
            ) : (
              <>
                <Mail className="h-6 w-6" />
                Preview & Send Paystubs
              </>
            )}
          </CardTitle>
          <CardDescription>
            {step === 'upload' 
              ? "Upload a CSV file to generate paystubs for your drivers"
              : `Reviewing ${totalPdfs} generated paystubs`
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className={`mb-4 ${error.startsWith('success:') ? 'bg-green-50' : 'bg-red-50'}`}>
              <AlertTitle>
                {error.startsWith('success:') ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription>
                {error.replace('success:', '')}
              </AlertDescription>
            </Alert>
          )}

          {step === 'upload' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={loading || !file}
                  className="min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Process CSV
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Single View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="space-y-4">
                  <PreviewNavigation />
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <iframe
                      src={`data:application/pdf;base64,${pdfData[driverNames[currentPreviewIndex]]}`}
                      className="w-full h-[700px]"
                      title={`PDF Preview - ${driverNames[currentPreviewIndex]}`}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="list">
                  <div className="space-y-4 max-h-[700px] overflow-y-auto">
                    {driverNames.map((driverName, index) => (
                      <Card key={driverName} className="overflow-hidden">
                        <CardHeader className="py-3">
                          <CardTitle className="text-lg">
                            {driverName} (PDF {index + 1})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <iframe
                            src={`data:application/pdf;base64,${pdfData[driverName]}`}
                            className="w-full h-[500px]"
                            title={`PDF Preview - ${driverName}`}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>

        {step === 'preview' && (
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setStep('upload')}
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Emails ({totalPdfs})
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Home;