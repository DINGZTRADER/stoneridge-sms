import React, { useState } from 'react';
import { z } from 'zod';
import { csvStudentRowSchema } from '../../schemas/studentSchemas';
import Button from '../Button';
import AlertMessage from '../common/AlertMessage';
import LoadingSpinner from '../LoadingSpinner';
import { apiService } from '../../services/apiService';
import { Student } from '../../types';

interface StudentImportFormProps {
  onImportSuccess: () => void;
}

interface CsvRow {
  [key: string]: string;
}

interface RowValidationError {
  row: number;
  issues: string[];
}

const StudentImportForm: React.FC<StudentImportFormProps> = ({ onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | Array<RowValidationError> | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccessMessage(null);
      setErrorMessage(null);
    } else {
      setFile(null);
    }
  };

  const parseCsv = (csvText: string): CsvRow[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) return [];
    const headers = lines[0].split(',').map(header => header.trim());
    const data: CsvRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',').map(value => value.trim());
      if (values.length !== headers.length) {
        throw new Error(`Row ${i + 1} has an incorrect number of columns. Expected ${headers.length}, got ${values.length}.`);
      }
      const row: CsvRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
    return data;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!file) {
      setErrorMessage('Please select a CSV file to import.');
      setLoading(false);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const csvText = event.target?.result as string;
          const parsedData = parseCsv(csvText);

          if (parsedData.length === 0) {
            setErrorMessage('CSV file is empty or contains no data rows.');
            setLoading(false);
            return;
          }

          const studentsToImport: Omit<Student, 'id' | 'admissionNumber'>[] = [];
          const validationErrors: RowValidationError[] = [];

          for (let i = 0; i < parsedData.length; i++) {
            const row = parsedData[i];
            const result = csvStudentRowSchema.safeParse(row);
            if (!result.success) {
              const rowErrors = result.error.issues.map(issue => `Field '${issue.path.join('.') || 'unknown'}': ${issue.message}`).filter(Boolean);
              validationErrors.push({ row: i + 2, issues: rowErrors });
              continue;
            }

            const v = result.data;
            studentsToImport.push({
              firstName: v.firstName,
              lastName: v.lastName,
              dateOfBirth: v.dateOfBirth,
              grade: v.grade,
              isUPE: v.isUPE.toLowerCase() === 'true',
              medicalDetails: {
                allergies: v.allergies || undefined,
                doctorName: v.doctorName || undefined,
                doctorContact: v.doctorContact || undefined,
              },
              emergencyContact: {
                name: v.emergencyContactName,
                phone: v.emergencyContactPhone,
                relationship: v.emergencyContactRelationship || undefined,
              },
              guardian: {
                name: v.guardianName,
                relationship: v.guardianRelationship,
                phoneNumber: v.guardianPhoneNumber,
                occupation: v.guardianOccupation || undefined,
                placeOfWork: v.guardianPlaceOfWork || undefined,
                nationality: v.guardianNationality || undefined,
              },
            });
          }

          if (validationErrors.length > 0) {
            setErrorMessage(validationErrors);
            if (studentsToImport.length > 0) {
              await apiService.bulkAddStudents(studentsToImport);
              setSuccessMessage(`Successfully imported ${studentsToImport.length} students with some validation warnings.`);
              onImportSuccess();
            }
          } else if (studentsToImport.length > 0) {
            await apiService.bulkAddStudents(studentsToImport);
            setSuccessMessage(`Successfully imported ${studentsToImport.length} students!`);
            onImportSuccess();
          } else {
            setErrorMessage('No valid student data found.');
          }
          setFile(null);
        } catch (innerError) {
          setErrorMessage((innerError as Error).message);
          console.error('CSV processing error:', innerError);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (outerError) {
      setErrorMessage((outerError as Error).message);
      console.error('File read error:', outerError);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Import Student Data from CSV</h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload a CSV file with the following headers:
        <code className="block bg-gray-100 p-2 mt-2 rounded text-xs">
          firstName,lastName,dateOfBirth,grade,isUPE,allergies,doctorName,doctorContact,emergencyContactName,emergencyContactPhone,emergencyContactRelationship,guardianName,guardianRelationship,guardianPhoneNumber,guardianOccupation,guardianPlaceOfWork,guardianNationality
        </code>
      </p>

      {successMessage && <AlertMessage type="success" message={successMessage} className="mb-4" />}
      {errorMessage && typeof errorMessage === 'string' && <AlertMessage type="error" message={errorMessage} className="mb-4" />}
      {errorMessage && Array.isArray(errorMessage) && errorMessage.length > 0 && (
        <AlertMessage type="error" className="mb-4">
          <p className="font-bold mb-2">Validation failed for the following rows:</p>
          <ul className="list-disc list-inside space-y-1">
            {errorMessage.map((rowError, index) => (
              <li key={index}>
                <strong className="text-red-800">Row {rowError.row}:</strong>
                <ul className="list-disc list-inside ml-4">
                  {rowError.issues.map((issue, issueIndex) => (
                    <li key={issueIndex} className="text-red-700">{issue}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </AlertMessage>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <label htmlFor="csv-file-upload" className="block text-gray-700 text-sm font-bold mb-2">
            Choose CSV File
          </label>
          <input
            id="csv-file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {file && <p className="mt-2 text-sm text-gray-600">Selected file: {file.name}</p>}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading || !file}>
            {loading ? <LoadingSpinner /> : 'Upload & Import'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StudentImportForm;