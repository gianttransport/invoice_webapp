// "use client";

// import Link from "next/link";

// export default function Home() {
//   return (
//     <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
//       <h1 className="text-3xl font-bold mb-6">Paystub Generator</h1>
//       <p className="text-gray-600 mb-8">
//         Please pick one of the following actions:
//       </p>

//       <div className="flex flex-col sm:flex-row gap-4">
//         {/* Link to the Weekly/Monthly Invoices page */}
//         <Link
//           href="/driversinvoice"
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded shadow text-lg"
//         >
//           Generate Weekly Invoices
//         </Link>

//         {/* Link to the 1099 Totals page */}
//         <Link
//           href="/generatetotals"
//           className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded shadow text-lg"
//         >
//           Generate 1099 Totals
//         </Link>
//       </div>
//     </main>
//   );
// }

"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 border border-gray-100">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">
          Paystub Generator
        </h1>
        
        <div className="h-1 w-24 mx-auto mb-6 bg-blue-500 rounded-full"></div>
        
        <p className="text-gray-600 mb-8 text-center">
          Please pick one of the following actions:
        </p>

        <div className="flex flex-col gap-4">
          {/* Link to the Weekly/Monthly Invoices page */}
          <Link
            href="/driversinvoice"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg shadow text-lg font-medium text-center transition-all duration-200"
          >
            Generate Weekly Invoices
          </Link>

          {/* Link to the 1099 Totals page */}
          <Link
            href="/generatetotals"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg shadow text-lg font-medium text-center transition-all duration-200"
          >
            Generate 1099 Totals
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-gray-400 text-sm text-center">
            Securely generate and manage your payment documents
          </p>
        </div>
      </div>
    </main>
  );
}