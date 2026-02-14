import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FeeStructure } from '../../types';
import Button from '../Button';

interface FinanceTableProps {
  fees: FeeStructure[];
}

const FinanceTable: React.FC<FinanceTableProps> = ({ fees }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Current Fee Structure</h2>
        <div className="space-x-2">
          <Button onClick={() => navigate('/finance/settings')} variant="secondary">
            Adjust Fees
          </Button>
          <Button onClick={() => navigate('/finance/invoice')}>
            View Invoice Template
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tuition (UGX)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scholastic Materials (UGX)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total (UGX)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fees.map((fee) => (
              <tr key={fee.grade}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {fee.grade}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fee.tuition.toLocaleString('en-UG')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fee.scholasticMaterials.toLocaleString('en-UG')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  {fee.total.toLocaleString('en-UG')}
                </td>
              </tr>
            ))}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={4}>
                <p className="text-xs text-gray-600 italic mt-2">
                  * UPE students will have 0 UGX for Tuition, but still pay for Scholastic Materials.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceTable;