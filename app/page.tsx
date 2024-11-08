
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
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
  <div className="container mx-auto px-4 py-8 max-w-5xl">
    <Card className="w-full border border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-white/80 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5" />
      
      <CardHeader className="border-b bg-gradient-to-r from-gray-800 to-slate-700 text-white rounded-t-lg relative p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        <CardTitle className="text-3xl flex items-center gap-3 font-bold">
          {step === 'upload' ? (
            <>
              <FileText className="h-8 w-8 text-blue-400" />
              Paystub Generator
            </>
          ) : (
            <>
              <Mail className="h-8 w-8 text-blue-400" />
              Preview & Send Paystubs
            </>
          )}
        </CardTitle>
        <CardDescription className="text-gray-300 text-lg mt-2">
          {step === 'upload' 
            ? "Upload a CSV file to generate paystubs for your drivers"
            : `Reviewing ${totalPdfs} generated paystubs`
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8 relative">
        {error && (
          <Alert className={`mb-6 ${error.startsWith('success:') ? 'bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/10' : 'bg-red-50 border-red-200'}`}>
            <AlertTitle className={`text-lg ${error.startsWith('success:') ? 'text-blue-800' : 'text-red-800'}`}>
              {error.startsWith('success:') ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription className={`text-base ${error.startsWith('success:') ? 'text-blue-700' : 'text-red-700'}`}>
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
                className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500/30 shadow-sm text-lg py-6"
              />
              <Button 
                type="submit" 
                disabled={loading || !file}
                className="min-w-[160px] h-14 bg-gradient-to-r from-gray-700 to-slate-600 hover:from-gray-600 hover:to-slate-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Process CSV
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-0.5 max-w-md mx-auto rounded-lg">
                <TabsTrigger value="preview" className="data-[state=active]:bg-white data-[state=active]:text-gray-700 data-[state=active]:shadow-md text-gray-600 text-base py-2">
                  Single View
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:text-gray-700 data-[state=active]:shadow-md text-gray-600 text-base py-2">
                  List View
                </TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="space-y-4">
                <PreviewNavigation />
                <div className="border border-blue-200 rounded-lg overflow-hidden bg-white shadow-xl shadow-blue-500/20">
                  <iframe
                    src={`data:application/pdf;base64,${pdfData[driverNames[currentPreviewIndex]]}`}
                    className="w-full h-[800px]"
                    title={`PDF Preview - ${driverNames[currentPreviewIndex]}`}
                  />
                </div>
              </TabsContent>
              <TabsContent value="list">
                <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2">
                  {driverNames.map((driverName, index) => (
                    <Card key={driverName} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 shadow-blue-500/10 hover:shadow-blue-500/20 border border-blue-200">
                      <CardHeader className="py-6 bg-gradient-to-r from-gray-700 to-slate-600">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-2xl text-white font-bold">
                            {driverName}
                          </CardTitle>
                          <span className="text-xl text-gray-200 font-medium">
                            PDF #{index + 1}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <iframe
                          src={`data:application/pdf;base64,${pdfData[driverName]}`}
                          className="w-full h-[600px]"
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
        <CardFooter className="flex justify-between p-8 border-t bg-gradient-to-r from-gray-50 to-white relative">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />
          <Button 
            variant="outline"
            onClick={() => setStep('upload')}
            disabled={loading}
            className="border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm text-lg h-12 px-6"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={loading}
            className="bg-gradient-to-r from-gray-700 to-slate-600 hover:from-gray-600 hover:to-slate-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 text-lg h-12 px-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending
              </>
            ) : (
              <>
                <Mail className="mr-2 h-5 w-5" />
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