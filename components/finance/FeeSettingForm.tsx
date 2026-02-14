import React, { useEffect, useState } from 'react';
import InputField from '../InputField';
import Button from '../Button';
import AlertMessage from '../common/AlertMessage';
import LoadingSpinner from '../LoadingSpinner';
import { apiService } from '../../services/apiService';
import { FeeStructure } from '../../types';

const FeeSettingForm: React.FC = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const fetchedFees = await apiService.getFeeStructures();
        setFeeStructures(fetchedFees);
      } catch (err) {
        console.error('Failed to fetch fee structures:', err);
        setErrorMessage('Failed to load current fee structures.');
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const handleChange = (grade: string, field: 'tuition' | 'scholasticMaterials', value: string) => {
    setFeeStructures((prevFees) =>
      prevFees.map((fee) =>
        fee.grade === grade
          ? {
              ...fee,
              [field]: parseInt(value, 10) || 0,
              total: (field === 'tuition' ? (parseInt(value, 10) || 0) + fee.scholasticMaterials : fee.tuition + (parseInt(value, 10) || 0)),
            }
          : fee
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      for (const fee of feeStructures) {
        await apiService.updateFeeStructure(fee.grade, fee.tuition, fee.scholasticMaterials);
      }
      setSuccessMessage('Fee structures updated successfully!');
    } catch (err) {
      console.error('Failed to update fee structures:', err);
      setErrorMessage('Failed to update fee structures. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Adjust Fee Structures</h2>

      {successMessage && <AlertMessage type="success" message={successMessage} className="mb-4" />}
      {errorMessage && <AlertMessage type="error" message={errorMessage} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {feeStructures.map((fee) => (
          <div key={fee.grade} className="border border-gray-200 p-4 rounded-md bg-gray-50">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">{fee.grade} Fees</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Tuition (UGX)"
                name={`${fee.grade}-tuition`}
                type="number"
                value={fee.tuition.toString()}
                onChange={(e) => handleChange(fee.grade, 'tuition', e.target.value)}
                min="0"
              />
              <InputField
                label="Scholastic Materials (UGX)"
                name={`${fee.grade}-scholastic`}
                type="number"
                value={fee.scholasticMaterials.toString()}
                onChange={(e) => handleChange(fee.grade, 'scholasticMaterials', e.target.value)}
                min="0"
              />
            </div>
            <p className="mt-3 text-lg font-bold text-gray-800">Total: {fee.total.toLocaleString('en-UG')} UGX</p>
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? <LoadingSpinner /> : 'Save Fee Structures'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FeeSettingForm;