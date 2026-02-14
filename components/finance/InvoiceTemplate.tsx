import React from 'react';
import { FeeStructure, Student } from '../../types';
import {
  BANK_NAME,
  BANK_ACCOUNT_NAME,
  BANK_ACCOUNT_NUMBER,
  BANK_BRANCH,
  BANK_SWIFT,
  SCHOOL_YEAR,
} from '../../constants';

interface InvoiceTemplateProps {
  student: Student;
  fees: FeeStructure;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ student, fees }) => {
  // Audit §1: UPE Compliance – tuition = 0, scholastic > 0
  const effectiveTuition = student.isUPE ? 0 : fees.tuition;
  const effectiveTotal = effectiveTuition + fees.scholasticMaterials;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg border border-gray-200" id="invoice-printable">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">The Stoneridge School</h1>
          <p className="text-sm text-gray-600">School Year: {SCHOOL_YEAR}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold text-indigo-600">INVOICE</h2>
          <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
          <p className="text-sm text-gray-500">Invoice #: SR{Math.floor(Math.random() * 100000)}</p>
        </div>
      </div>

      {/* Billing Details */}
      <div className="grid grid-cols-2 gap-y-4 mb-8 text-sm text-gray-700">
        <div>
          <h3 className="font-bold text-gray-800 mb-2">Billed To:</h3>
          <p>{student.firstName} {student.lastName}</p>
          <p>Admission No: {student.admissionNumber}</p>
          <p>Grade: {student.grade}</p>
          <p>Guardian: {student.guardian.name}</p>
          <p>Contact: {student.guardian.phoneNumber}</p>
        </div>
        <div className="text-right">
          <h3 className="font-bold text-gray-800 mb-2">School Details:</h3>
          <p>The Stoneridge School</p>
          <p>P.O. Box 12345, Kampala, Uganda</p>
          <p>Email: info@stoneridge.ug</p>
          <p>Phone: +256 700 123456</p>
        </div>
      </div>

      {/* Fee Breakdown – Audit §5: Tuition & Scholastic in separate rows */}
      <div className="mb-8">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount (UGX)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Tuition Fee ({student.grade}) {student.isUPE ? '(UPE Student – No Tuition)' : ''}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                {effectiveTuition.toLocaleString('en-UG')}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Scholastic Materials Fee
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                {fees.scholasticMaterials.toLocaleString('en-UG')}
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900">
                Total Amount Due
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-indigo-600 text-right">
                {effectiveTotal.toLocaleString('en-UG')} UGX
              </td>
            </tr>
            {/* Audit spec notes for P.1 */}
            {student.grade === 'P.1' && !student.isUPE && (
              <tr className="bg-yellow-50">
                <td colSpan={2} className="px-6 py-2 text-xs text-yellow-800 italic text-center">
                  (P.1 Standard Fee: 1,600,000 Tuition + 110,000 Scholastic = 1,710,000 UGX)
                </td>
              </tr>
            )}
            {/* Audit spec notes for Pre-Primary */}
            {student.grade === 'Pre-Primary' && !student.isUPE && (
              <tr className="bg-yellow-50">
                <td colSpan={2} className="px-6 py-2 text-xs text-yellow-800 italic text-center">
                  (Pre-Primary Standard Fee: 1,350,000 Tuition + 105,000 Scholastic = 1,455,000 UGX)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Due */}
      <div className="flex justify-end mb-8 text-sm text-gray-700">
        <p><strong>Payment Due:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      </div>

      {/* Audit §1: Complete Bank Details Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-600">
        <p>Thank you for your prompt payment!</p>
        <div className="mt-3 p-3 bg-gray-50 rounded-md inline-block text-left">
          <p className="font-bold text-gray-800 mb-1">Bank Payment Details:</p>
          <p><strong>Bank:</strong> {BANK_NAME}</p>
          <p><strong>Account Name:</strong> {BANK_ACCOUNT_NAME}</p>
          <p><strong>Account Number:</strong> {BANK_ACCOUNT_NUMBER}</p>
          <p><strong>Branch:</strong> {BANK_BRANCH}</p>
          <p><strong>Swift Code:</strong> {BANK_SWIFT}</p>
        </div>
        <p className="mt-2">The Stoneridge School</p>
      </div>
    </div>
  );
};