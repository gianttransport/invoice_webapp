// // pages/index.tsx
// 'use client'
// import React, { useState, ChangeEvent, FormEvent } from 'react';

// interface PdfData {
//   [driverName: string]: string;
// }

// const Home: React.FC = () => {
//   const [file, setFile] = useState<File | null>(null);
//   const [pdfData, setPdfData] = useState<PdfData>({});
//   const [step, setStep] = useState<'upload' | 'preview'>('upload');

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setFile(e.target.files[0]);
//     } else {
//       setFile(null);
//     }
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();

//     if (!file) {
//       alert('Please upload a CSV file.');
//       return;
//     }

//     // Prepare form data
//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       // Send request to the Flask backend
//       const res = await fetch('http://127.0.0.1:5000/process_csv/', {
//         method: 'POST',
//         body: formData,
//       });

//       const result = await res.json();
//       if (res.ok) {
//         setPdfData(result.pdfs);
//         setStep('preview');
//       } else {
//         alert(`Error: ${result.error}`);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('An error occurred while processing the file.');
//     }
//   };

//   const handleConfirm = async () => {
//     try {
//       // Send a request to the backend to send the emails
//       const res = await fetch('http://localhost:5000/send_emails/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ pdfs: pdfData }),
//       });

//       const result = await res.json();
//       if (res.ok) {
//         alert(result.message);
//         setStep('upload');
//         setPdfData({});
//         setFile(null);
//       } else {
//         alert(`Error: ${result.error}`);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('An error occurred while sending emails.');
//     }
//   };

//   const renderPreviews = () => {
//     return Object.keys(pdfData).map((driverName) => (
//       <div key={driverName}>
//         <h3>{driverName}</h3>
//         <iframe
//           src={`data:application/pdf;base64,${pdfData[driverName]}`}
//           width="600"
//           height="800"
//           title={`PDF Preview - ${driverName}`}
//         ></iframe>
//       </div>
//     ));
//   };

//   return (
//     <div>
//       {step === 'upload' && (
//         <div>
//           <h1>Upload CSV to Generate Paystubs</h1>
//           <form onSubmit={handleSubmit}>
//             <input
//               type="file"
//               accept=".csv"
//               onChange={handleFileChange}
//             />
//             <button type="submit">Upload and Process</button>
//           </form>
//         </div>
//       )}
//       {step === 'preview' && (
//         <div>
//           <h1>Preview Paystubs</h1>
//           {renderPreviews()}
//           <button onClick={handleConfirm}>Send Emails</button>
//           <button onClick={() => setStep('upload')}>Cancel</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;



// 'use client'
// import React, { useState, ChangeEvent, FormEvent } from 'react';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Upload, FileText, Mail, ArrowLeft, Loader2 } from "lucide-react";

// interface PdfData {
//   [driverName: string]: string;
// }

// const Home = () => {
//   const [file, setFile] = useState<File | null>(null);
//   const [pdfData, setPdfData] = useState<PdfData>({});
//   const [step, setStep] = useState<'upload' | 'preview'>('upload');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setError(null);
//     if (e.target.files && e.target.files.length > 0) {
//       setFile(e.target.files[0]);
//     } else {
//       setFile(null);
//     }
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     if (!file) {
//       setError('Please upload a CSV file.');
//       return;
//     }

//     setLoading(true);
//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const res = await fetch('http://127.0.0.1:5000/process_csv/', {
//         method: 'POST',
//         body: formData,
//       });

//       const result = await res.json();
//       if (res.ok) {
//         setPdfData(result.pdfs);
//         setStep('preview');
//       } else {
//         setError(result.error || 'An error occurred while processing the file.');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setError('An error occurred while processing the file.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleConfirm = async () => {
//     setError(null);
//     setLoading(true);

//     try {
//       const res = await fetch('http://localhost:5000/send_emails/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ pdfs: pdfData }),
//       });

//       const result = await res.json();
//       if (res.ok) {
//         setStep('upload');
//         setPdfData({});
//         setFile(null);
//         // Show success message
//         setError('success:' + result.message);
//       } else {
//         setError(result.error || 'An error occurred while sending emails.');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setError('An error occurred while sending emails.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-4xl">
//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle className="text-2xl flex items-center gap-2">
//             {step === 'upload' ? (
//               <>
//                 <FileText className="h-6 w-6" />
//                 Paystub Generator
//               </>
//             ) : (
//               <>
//                 <Mail className="h-6 w-6" />
//                 Preview & Send Paystubs
//               </>
//             )}
//           </CardTitle>
//           <CardDescription>
//             {step === 'upload' 
//               ? "Upload a CSV file to generate paystubs for your drivers"
//               : "Review the generated paystubs before sending them via email"
//             }
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           {error && (
//             <Alert className={`mb-4 ${error.startsWith('success:') ? 'bg-green-50' : 'bg-red-50'}`}>
//               <AlertTitle>
//                 {error.startsWith('success:') ? 'Success' : 'Error'}
//               </AlertTitle>
//               <AlertDescription>
//                 {error.replace('success:', '')}
//               </AlertDescription>
//             </Alert>
//           )}

//           {step === 'upload' ? (
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="flex items-center gap-4">
//                 <Input
//                   type="file"
//                   accept=".csv"
//                   onChange={handleFileChange}
//                   className="flex-1"
//                 />
//                 <Button 
//                   type="submit" 
//                   disabled={loading || !file}
//                   className="min-w-[140px]"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Processing
//                     </>
//                   ) : (
//                     <>
//                       <Upload className="mr-2 h-4 w-4" />
//                       Process CSV
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </form>
//           ) : (
//             <div className="space-y-6">
//               {Object.keys(pdfData).map((driverName) => (
//                 <div key={driverName} className="space-y-2">
//                   <h3 className="text-lg font-semibold">{driverName}</h3>
//                   <div className="border rounded-lg overflow-hidden">
//                     <iframe
//                       src={`data:application/pdf;base64,${pdfData[driverName]}`}
//                       className="w-full h-[600px]"
//                       title={`PDF Preview - ${driverName}`}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>

//         {step === 'preview' && (
//           <CardFooter className="flex justify-between">
//             <Button 
//               variant="outline" 
//               onClick={() => setStep('upload')}
//               disabled={loading}
//             >
//               <ArrowLeft className="mr-2 h-4 w-4" />
//               Back
//             </Button>
//             <Button 
//               onClick={handleConfirm}
//               disabled={loading}
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Sending
//                 </>
//               ) : (
//                 <>
//                   <Mail className="mr-2 h-4 w-4" />
//                   Send Emails
//                 </>
//               )}
//             </Button>
//           </CardFooter>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default Home;

'use client'
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileText, Mail, ArrowLeft, Loader2, Download } from "lucide-react";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface PdfData {
  [driverName: string]: string;
}

const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfData, setPdfData] = useState<PdfData>({});
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
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
      const res = await fetch('http://127.0.0.1:5000/process_csv/', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        setPdfData(result.pdfs);
        setStep('preview');
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
      const res = await fetch('http://localhost:5000/send_emails/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfs: pdfData }),
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

  const handleDownloadAll = async () => {
    setDownloadLoading(true);
    try {
      const zip = new JSZip();
      
      // Add each PDF to the ZIP file
      Object.entries(pdfData).forEach(([driverName, base64Data]) => {
        // Convert base64 to binary
        const binaryStr = atob(base64Data);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        
        // Add to zip with sanitized filename
        const sanitizedName = driverName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        zip.file(`${sanitizedName}_paystub.pdf`, bytes);
      });

      // Generate and download the ZIP file
      const content = await zip.generateAsync({ type: "blob" });
      const timestamp = new Date().toISOString().split('T')[0];
      saveAs(content, `paystubs_${timestamp}.zip`);
      
      setError('success:All PDFs have been downloaded successfully');
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      setError('An error occurred while creating the ZIP file');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDownloadSingle = (driverName: string, base64Data: string) => {
    try {
      // Convert base64 to blob
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      
      // Download the file
      const sanitizedName = driverName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      saveAs(blob, `${sanitizedName}_paystub.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError('An error occurred while downloading the PDF');
    }
  };

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
              : "Review the generated paystubs before sending them via email"
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
                  accept=".csv"
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
            <div className="space-y-6">
              {Object.entries(pdfData).map(([driverName, base64Data]) => (
                <div key={driverName} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{driverName}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadSingle(driverName, base64Data)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      src={`data:application/pdf;base64,${base64Data}`}
                      className="w-full h-[600px]"
                      title={`PDF Preview - ${driverName}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {step === 'preview' && (
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('upload')}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadAll}
                disabled={downloadLoading}
              >
                {downloadLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating ZIP
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download All
                  </>
                )}
              </Button>
            </div>
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
                  Send Emails
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