import React, { useState } from 'react';
import { Beaker, Pill, Stethoscope } from 'lucide-react';

const STAGES = {
    INITIAL_CHECK: 'INITIAL_CHECK',
    LAB_REVIEW: 'LAB_REVIEW'
};

const TEST_OPTIONS = ['CBC', 'Lipid Profile', 'Blood Sugar', 'X-Ray', 'Urinalysis'];
const MEDICINE_OPTIONS = ['Paracetamol', 'Amoxicillin', 'Vitamin D', 'Insulin', 'ORS'];

const getNextToken = (token) => {
    const match = token.match(/(\D+)(\d+)$/);
    if (!match) return token;
    return `${match[1]}${Number(match[2]) + 1}`;
};

export default function DepartmentQueueCard({
    departmentName = 'General Medicine',
    initialToken = 'GEN-1',
    className = ''
}) {
    const [patientToken, setPatientToken] = useState(initialToken);
    const [stage, setStage] = useState(STAGES.INITIAL_CHECK);
    const [selectedTests, setSelectedTests] = useState('');
    const [selectedMedicines, setSelectedMedicines] = useState('');
    const [submittedTests, setSubmittedTests] = useState('');
    const [submittedMedicines, setSubmittedMedicines] = useState('');

    const isInitialStage = stage === STAGES.INITIAL_CHECK;
    const isLabReviewStage = stage === STAGES.LAB_REVIEW;

    const handleSubmitTests = () => {
        if (!selectedTests) return;
        setSubmittedTests(selectedTests);
        setStage(STAGES.LAB_REVIEW);
    };

    const handleSubmitMedicines = () => {
        if (!selectedMedicines) return;
        setSubmittedMedicines(selectedMedicines);
    };

    const handleCallNext = () => {
        setPatientToken(getNextToken(patientToken));
        setStage(STAGES.INITIAL_CHECK);
        setSelectedTests('');
        setSelectedMedicines('');
        setSubmittedTests('');
        setSubmittedMedicines('');
    };

    const activeTestsValue = isInitialStage ? selectedTests : submittedTests || selectedTests;
    const activeMedicinesValue = selectedMedicines || submittedMedicines;

    return (
        <div className={`rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur ${className}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-600">
                        <Stethoscope size={14} />
                        Doctor Queue
                    </div>
                    <h3 className="mt-3 text-2xl font-black text-slate-900">{departmentName}</h3>
                    <p className="mt-1 text-sm text-slate-500">Two-stage visit flow with test review and medicine dispatch.</p>
                </div>
                <div className={`rounded-2xl px-4 py-3 text-center ${isInitialStage ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em]">Active Token</p>
                    <p className="text-2xl font-black">{patientToken}</p>
                </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">Current patient stage</p>
                        <p className={`mt-1 text-sm font-medium ${isInitialStage ? 'text-blue-600' : 'text-emerald-600'}`}>
                            {isInitialStage ? 'Initial Check' : 'Lab Review'}
                        </p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-xs font-semibold ${isInitialStage ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isInitialStage ? 'Tests pending' : 'Medicines ready'}
                    </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="space-y-2" htmlFor="tests-select">
                        <span className="text-sm font-semibold text-slate-700">Tests</span>
                        <div className="flex gap-2">
                            <select
                                id="tests-select"
                                value={activeTestsValue}
                                onChange={(event) => setSelectedTests(event.target.value)}
                                disabled={isLabReviewStage}
                                className={`w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none transition ${isLabReviewStage ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
                            >
                                <option value="">Select test</option>
                                {TEST_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleSubmitTests}
                                aria-label="Submit tests"
                                disabled={!selectedTests || isLabReviewStage}
                                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200"
                            >
                                <Beaker size={18} />
                            </button>
                        </div>
                    </label>

                    <label className="space-y-2" htmlFor="medicines-select">
                        <span className="text-sm font-semibold text-slate-700">Medicines</span>
                        <div className="flex gap-2">
                            <select
                                id="medicines-select"
                                value={activeMedicinesValue}
                                onChange={(event) => setSelectedMedicines(event.target.value)}
                                disabled={isInitialStage}
                                className={`w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none transition ${isInitialStage ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'}`}
                            >
                                <option value="">Select medicine</option>
                                {MEDICINE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleSubmitMedicines}
                                aria-label="Submit medicines"
                                disabled={!selectedMedicines || isInitialStage}
                                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
                            >
                                <Pill size={18} />
                            </button>
                        </div>
                    </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-700">Status:</span>
                    {isInitialStage ? (
                        <span className="text-blue-600">Tests are being ordered for the current consult.</span>
                    ) : (
                        <span className="text-emerald-600">Lab review completed. Medicines can now be dispensed.</span>
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={handleCallNext}
                className="mt-6 w-full rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
                Call Next
            </button>
        </div>
    );
}
