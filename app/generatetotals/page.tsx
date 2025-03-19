"use client"

import React, { useState, ChangeEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Upload } from "lucide-react";

// Example TypeScript interfaces for your data
interface DriverTotal {
  driver_name: string;
  pay_multiplier: number;
  total_net: number;
  total_earning_after_multiplier: number;
}

interface UnmatchedDriver {
  name: string;
  normalized_name: string;
}

const GenerateTotalsPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [driverTotals, setDriverTotals] = useState<DriverTotal[]>([]);
  const [unmatchedDrivers, setUnmatchedDrivers] = useState<UnmatchedDriver[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Handle multiple file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      // Filter for .xlsx or .csv if you want
      const validFiles = Array.from(e.target.files).filter((file) =>
        file.name.toLowerCase().match(/\.(xlsx|csv)$/)
      );
      if (validFiles.length === 0) {
        setError("Please upload valid Excel (.xlsx) or CSV files.");
        setFiles([]);
      } else {
        setFiles(validFiles);
      }
    }
  };

  // 2. Send selected files to the totals endpoint
  const handleGenerateTotals = async () => {
    if (files.length === 0) {
      setError("No files selected.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      // POINT THIS TO YOUR ACTUAL BACKEND ENDPOINT:
      const res = await fetch("https://giant-invoice-backend-17cc62c09e71.herokuapp.com/process_excels_totals/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error generating totals.");
      }

      // Data structure from your endpoint might look like:
      // {
      //   "driver_totals": [
      //     { "driver_name": "...", "pay_multiplier": 0.75, "total_net": 1000, "total_earning_after_multiplier": 750 },
      //     ...
      //   ],
      //   "unmatched_drivers": [ { ... }, ... ],
      //   ...
      // }
      setDriverTotals(data.driver_totals || []);
      setUnmatchedDrivers(data.unmatched_drivers || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <Card className="w-full border border-blue-300 shadow-lg relative overflow-hidden bg-white/80 backdrop-blur-xl">
          {/* Header */}
          <CardHeader className="border-b bg-gradient-to-r from-gray-800 to-slate-700 text-white rounded-t-lg relative p-8">
            <CardTitle className="text-3xl flex items-center gap-3 font-bold">
              <Upload className="h-8 w-8 text-blue-400" />
              Generate Totals
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg mt-2">
              Upload multiple Excel/CSV files to see each driver&apos;s
              aggregated totals (no PDF generated).
            </CardDescription>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-8 relative space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert className="bg-red-50 border-red-200 text-red-700 shadow">
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* File Input + Button */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Input
                type="file"
                multiple
                accept=".xlsx,.csv"
                onChange={handleFileChange}
                className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500 py-6 text-lg shadow-sm"
              />
              <Button
                onClick={handleGenerateTotals}
                disabled={loading}
                className="min-w-[160px] h-14 bg-gradient-to-r from-gray-700 to-slate-600 hover:from-gray-600 hover:to-slate-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Generate Totals
                  </>
                )}
              </Button>
            </div>

            {/* Unmatched Drivers */}
            {unmatchedDrivers.length > 0 && (
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertTitle className="text-yellow-900 font-semibold">
                  Unmatched Drivers
                </AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {unmatchedDrivers.map((ud, idx) => (
                      <li key={idx}>
                        {ud.name} (normalized: {ud.normalized_name})
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Driver Totals Table */}
            {driverTotals.length > 0 && (
              <div className="overflow-x-auto border border-blue-200 rounded-lg bg-white shadow-xl shadow-blue-500/20">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Driver Name</TableHead>
                      <TableHead>Pay Multiplier</TableHead>
                      <TableHead>Total Net</TableHead>
                      <TableHead>Earning After Multiplier</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {driverTotals.map((d, index) => (
                      <TableRow key={index}>
                        <TableCell>{d.driver_name}</TableCell>
                        <TableCell>{d.pay_multiplier}</TableCell>
                        <TableCell>{d.total_net}</TableCell>
                        <TableCell>
                          {d.total_earning_after_multiplier}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {/* Footer (Optional) */}
          <CardFooter className="border-t bg-gradient-to-r from-gray-50 to-white p-8 flex justify-end">
            {/* If you want some additional button or info here */}
            <div className="text-gray-600 text-sm">
              {driverTotals.length > 0
                ? `${driverTotals.length} driver(s) processed.`
                : ""}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default GenerateTotalsPage;
