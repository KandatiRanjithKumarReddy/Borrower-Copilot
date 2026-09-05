import { useState, useCallback } from 'react';
import type { AssessmentInput, AssessmentResult } from './engine/types';
import { assessBorrower } from './engine';
import { LandingPage } from './components/LandingPage';
import { Questionnaire } from './components/Questionnaire';
import { ResultsPage } from './components/ResultsPage';

type AppScreen = 'landing' | 'questionnaire' | 'results';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [assessmentInput, setAssessmentInput] = useState<AssessmentInput | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const handleStart = useCallback(() => {
    setScreen('questionnaire');
  }, []);

  const handleLoadPersona = useCallback((input: AssessmentInput) => {
    setAssessmentInput(input);
    const assessmentResult = assessBorrower(input);
    setResult(assessmentResult);
    setScreen('results');
  }, []);

  const handleAssessmentComplete = useCallback((input: AssessmentInput) => {
    setAssessmentInput(input);
    const assessmentResult = assessBorrower(input);
    setResult(assessmentResult);
    setScreen('results');
  }, []);

  const handleStartOver = useCallback(() => {
    setAssessmentInput(null);
    setResult(null);
    setScreen('landing');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {screen === 'landing' && (
        <LandingPage
          onStart={handleStart}
          onLoadPersona={handleLoadPersona}
        />
      )}
      {screen === 'questionnaire' && (
        <Questionnaire
          onComplete={handleAssessmentComplete}
          onBack={() => setScreen('landing')}
        />
      )}
      {screen === 'results' && result && assessmentInput && (
        <ResultsPage
          result={result}
          input={assessmentInput}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}
