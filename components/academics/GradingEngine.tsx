import React, { useState } from 'react';
import InputField from '../InputField';
import Button from '../Button';
import { getUgandanGrade, UGANDAN_GRADING_TABLE } from '../../constants';

const GradingEngine: React.FC = () => {
    const [score, setScore] = useState<string>('');
    const [result, setResult] = useState<{ grade: string; description: string } | null>(null);
    const [history, setHistory] = useState<{ score: number; grade: string; description: string }[]>([]);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        const numScore = parseInt(score, 10);
        if (isNaN(numScore) || numScore < 0 || numScore > 100) {
            setResult(null);
            return;
        }
        const gradeResult = getUgandanGrade(numScore);
        setResult(gradeResult);
        setHistory((prev) => [{ score: numScore, ...gradeResult }, ...prev.slice(0, 19)]);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Ugandan Grading Engine</h2>
            <p className="text-gray-600 mb-6 text-sm">
                Ministry of Education grading scale (Source 378). Enter a student's score (0–100) to compute the grade.
            </p>

            {/* Score Input */}
            <form onSubmit={handleCalculate} className="flex items-end space-x-4 mb-8">
                <div className="flex-grow max-w-xs">
                    <InputField
                        label="Student Score (0–100)"
                        name="score"
                        type="number"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        min="0"
                        max="100"
                        placeholder="e.g., 81"
                    />
                </div>
                <Button type="submit" disabled={!score}>
                    Calculate Grade
                </Button>
            </form>

            {/* Result Display */}
            {result && (
                <div className="mb-8 p-6 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                    <p className="text-gray-600 text-sm">Score: <strong>{score}</strong></p>
                    <p className="text-5xl font-black text-indigo-700 mt-2">{result.grade}</p>
                    <p className="text-gray-600 text-sm mt-2">{result.description}</p>
                </div>
            )}

            {/* Grading Reference Table */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Grading Scale Reference</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score Range</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {UGANDAN_GRADING_TABLE.map((entry, i) => {
                                const nextMin = UGANDAN_GRADING_TABLE[i - 1]?.minScore;
                                const maxScore = nextMin ? nextMin - 1 : 100;
                                return (
                                    <tr key={entry.grade} className={result?.grade === entry.grade ? 'bg-indigo-50 font-semibold' : ''}>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            {entry.minScore}–{maxScore}
                                        </td>
                                        <td className="px-6 py-3 text-sm font-bold text-gray-900">{entry.grade}</td>
                                        <td className="px-6 py-3 text-sm text-gray-600">{entry.description}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                    Audit check: 81 → D1, 76 → D2, 72 → C3, 66 → C4, 61 → C5, 56 → C6, 52 → P7, 47 → P8, &lt;45 → F9
                </p>
            </div>

            {/* Grading History */}
            {history.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Recent Grades</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {history.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-3 text-sm text-gray-500">{idx + 1}</td>
                                        <td className="px-6 py-3 text-sm text-gray-700 font-medium">{item.score}</td>
                                        <td className="px-6 py-3 text-sm font-bold text-indigo-700">{item.grade}</td>
                                        <td className="px-6 py-3 text-sm text-gray-600">{item.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradingEngine;
