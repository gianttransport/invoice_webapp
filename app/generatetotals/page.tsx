"use client"

import React, { useState, ChangeEvent, useEffect } from "react";
import { Loader2, Upload, Download, FileSpreadsheet } from "lucide-react";

// TypeScript interfaces for your data
interface DriverTotal {
  driver_name: string;
  pay_multiplier: number;
  total_net: number;
  total_earning_after_multiplier: number;
}

// Add a utility function to fix NaN values
const fixNaN = (value: number): number => {
  return isNaN(value) || value === null || value === undefined ? 0 : Number(value);
};

interface UnmatchedDriver {
  name: string;
  normalized_name: string;
}

const GenerateTotalsPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [driverTotals, setDriverTotals] = useState<DriverTotal[]>([]);
  const [totalsWithSummary, setTotalsWithSummary] = useState<DriverTotal[]>([]);
  const [unmatchedDrivers, setUnmatchedDrivers] = useState<UnmatchedDriver[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate grand total whenever driverTotals changes
  useEffect(() => {
    if (driverTotals.length > 0) {
      // Create a copy of the driver totals with fixed NaN values
      const fixedTotals = driverTotals.map(driver => ({
        ...driver,
        total_net: fixNaN(driver.total_net),
        total_earning_after_multiplier: fixNaN(driver.total_earning_after_multiplier)
      }));
      
      // Calculate sum of total_net and total_earning_after_multiplier using fixed values
      const totalNet = fixedTotals.reduce((sum, driver) => sum + driver.total_net, 0);
      const totalEarning = fixedTotals.reduce((sum, driver) => sum + driver.total_earning_after_multiplier, 0);
      
      // Add summary row with totals
      const totalsWithTotal = [...fixedTotals, {
        driver_name: "TOTAL",
        pay_multiplier: 0, // Not applicable for total
        total_net: parseFloat(totalNet.toFixed(2)),
        total_earning_after_multiplier: parseFloat(totalEarning.toFixed(2))
      }];
      
      setTotalsWithSummary(totalsWithTotal);
    } else {
      setTotalsWithSummary([]);
    }
  }, [driverTotals]);

  // Handle multiple file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      // Filter for .xlsx or .csv
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

  // Send selected files to the totals endpoint
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

      // Point this to your actual backend endpoint
      const res = await fetch("https://giant-invoice-backend-17cc62c09e71.herokuapp.com/process_excels_totals/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error generating totals.");
      }

      // Process the returned data - fix any NaN, undefined, or null values
      const processedTotals = (data.driver_totals || []).map((driver: any) => ({
        driver_name: driver.driver_name || "Unknown Driver",
        pay_multiplier: fixNaN(driver.pay_multiplier),
        total_net: fixNaN(driver.total_net),
        total_earning_after_multiplier: fixNaN(driver.total_earning_after_multiplier)
      }));
      
      // Check if we have a "nan" entry that might be the total row from the backend
      const nanIndex = processedTotals.findIndex((driver:any) => 
        driver.driver_name.toLowerCase() === "nan" || 
        driver.driver_name.toLowerCase() === "null" || 
        driver.driver_name.toLowerCase() === "undefined"
      );
      
      if (nanIndex >= 0) {
        // Remove the invalid total row - we'll calculate our own
        processedTotals.splice(nanIndex, 1);
      }
      
      setDriverTotals(processedTotals);
      setUnmatchedDrivers(data.unmatched_drivers || []);
      
      // Log success message
      console.log(`Successfully processed ${processedTotals.length} driver records`);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate and download CSV
  const handleDownloadCSV = () => {
    if (totalsWithSummary.length === 0) {
      setError("No data to download.");
      return;
    }
    
    try {
      // Create CSV content
      const headers = ["Driver Name", "Pay Multiplier", "Total Net", "Earning After Multiplier"];
      let csvContent = headers.join(",") + "\n";
      
      // Format date for filename
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      totalsWithSummary.forEach(driver => {
        // Make sure all values are fixed numbers before formatting
        const totalNet = fixNaN(driver.total_net);
        const totalEarning = fixNaN(driver.total_earning_after_multiplier);
        const multiplier = driver.driver_name === "TOTAL" ? 0 : fixNaN(driver.pay_multiplier);
        
        // Format numbers to 2 decimal places
        const row = [
          `"${driver.driver_name}"`, // Wrap in quotes to handle commas in names
          driver.driver_name === "TOTAL" ? "-" : multiplier.toFixed(2),
          totalNet.toFixed(2),
          totalEarning.toFixed(2)
        ];
        csvContent += row.join(",") + "\n";
      });
      
      // Create a blob and download with date in filename
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `driver_totals_${dateStr}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up to avoid memory leaks
      
      console.log("CSV file successfully generated and downloaded");
    } catch (err: any) {
      console.error("Error generating CSV:", err);
      setError("Failed to generate CSV file.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="w-full border border-blue-300 shadow-lg relative overflow-hidden bg-white rounded-lg">
          {/* Header */}
          <div className="border-b bg-gradient-to-r from-gray-800 to-slate-700 text-white rounded-t-lg relative p-8">
            <h2 className="text-3xl flex items-center gap-3 font-bold">
              <Upload className="h-8 w-8 text-blue-400" />
              Generate Totals
            </h2>
            <p className="text-gray-300 text-lg mt-2">
              Upload multiple Excel/CSV files to see each driver&apos;s
              aggregated totals with CSV export option.
            </p>
          </div>

          {/* Content */}
          <div className="p-8 relative space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 shadow p-4 rounded-md">
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p>{error}</p>
              </div>
            )}

            {/* File Input + Button */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <input
                type="file"
                multiple
                accept=".xlsx,.csv"
                onChange={handleFileChange}
                className="flex-1 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 py-3 px-4 text-lg shadow-sm"
              />
              <button
                onClick={handleGenerateTotals}
                disabled={loading}
                className={`min-w-[160px] h-14 bg-gradient-to-r from-gray-700 to-slate-600 hover:from-gray-600 hover:to-slate-500 text-white shadow-lg transition-all rounded-md px-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Upload className="mr-2 h-5 w-5" />
                    <span>Generate Totals</span>
                  </div>
                )}
              </button>
            </div>

            {/* Unmatched Drivers */}
            {unmatchedDrivers.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
                <h3 className="text-yellow-900 font-semibold">
                  Unmatched Drivers
                </h3>
                <div>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {unmatchedDrivers.map((ud, idx) => (
                      <li key={idx}>
                        {ud.name} (normalized: {ud.normalized_name})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Driver Totals Table with CSV Download Button */}
            {totalsWithSummary.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold text-blue-700">
                    Driver Totals Summary
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDownloadCSV}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                    >
                      <FileSpreadsheet className="mr-2 h-5 w-5" />
                      Download CSV
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto border border-blue-200 rounded-lg bg-white shadow-lg">
                  <table className="w-full min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Multiplier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Net</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earning After Multiplier</th>
                      </tr>
                    </thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                      {totalsWithSummary.map((d, index) => {
                        // Make sure all values are fixed before formatting
                        const totalNet = fixNaN(d.total_net);
                        const totalEarning = fixNaN(d.total_earning_after_multiplier);
                        const multiplier = fixNaN(d.pay_multiplier);
                        
                        return (
                          <tr 
                            key={index}
                            className={d.driver_name === "TOTAL" ? "font-bold bg-gray-100" : ""}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">{d.driver_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {d.driver_name === "TOTAL" ? "-" : multiplier.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{totalNet.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{totalEarning.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gradient-to-r from-gray-50 to-white p-8 flex justify-end">
            <div className="text-gray-600 text-sm">
              {driverTotals.length > 0
                ? `${driverTotals.length} driver(s) processed.`
                : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateTotalsPage;