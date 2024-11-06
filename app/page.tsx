
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const res = await fetch('https://invoicegen2-58e6551905ba.herokuapp.com/process_excel/', {
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
      const res = await fetch('https://invoicegen2-58e6551905ba.herokuapp.com/send_email/', {
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
  <div className="flex items-center justify-between mb-4 bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow-sm">
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPreviewIndex(prev => Math.max(0, prev - 1))}
        disabled={currentPreviewIndex === 0}
        className="hover:bg-indigo-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium text-indigo-900">
        PDF {currentPreviewIndex + 1} of {totalPdfs}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPreviewIndex(prev => Math.min(totalPdfs - 1, prev + 1))}
        disabled={currentPreviewIndex === totalPdfs - 1}
        className="hover:bg-indigo-50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
    <div className="text-sm font-medium text-indigo-900">
      Driver: {driverNames[currentPreviewIndex]}
    </div>
  </div>
);

return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="w-full border-0 shadow-xl bg-white/80 backdrop-blur-lg">
        <CardHeader className="border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
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
          <CardDescription className="text-indigo-100">
            {step === 'upload' 
              ? "Upload a CSV file to generate paystubs for your drivers"
              : `Reviewing ${totalPdfs} generated paystubs`
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <Alert className={`mb-4 ${error.startsWith('success:') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <AlertTitle className={error.startsWith('success:') ? 'text-green-800' : 'text-red-800'}>
                {error.startsWith('success:') ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription className={error.startsWith('success:') ? 'text-green-700' : 'text-red-700'}>
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
                  className="flex-1 border-indigo-200 focus:ring-indigo-500"
                />
                <Button 
                  type="submit" 
                  disabled={loading || !file}
                  className="min-w-[140px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
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
                <TabsList className="grid w-full grid-cols-2 bg-indigo-100">
                  <TabsTrigger value="preview" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700">
                    Single View
                  </TabsTrigger>
                  <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700">
                    List View
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="space-y-4">
                  <PreviewNavigation />
                  <div className="border rounded-lg overflow-hidden bg-white shadow-md">
                    <iframe
                      src={`data:application/pdf;base64,${pdfData[driverNames[currentPreviewIndex]]}`}
                      className="w-full h-[700px]"
                      title={`PDF Preview - ${driverNames[currentPreviewIndex]}`}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="list">
                  <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                    {driverNames.map((driverName, index) => (
                      <Card key={driverName} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="py-3 bg-gradient-to-r from-indigo-50 to-purple-50">
                          <CardTitle className="text-lg text-indigo-900">
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
          <CardFooter className="flex justify-between p-6 border-t bg-gradient-to-r from-indigo-50 to-purple-50">
            <Button 
              variant="outline"
              onClick={() => setStep('upload')}
              disabled={loading}
              className="border-indigo-300 hover:bg-indigo-50 text-indigo-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
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
  </div>
);
};

export default Home;