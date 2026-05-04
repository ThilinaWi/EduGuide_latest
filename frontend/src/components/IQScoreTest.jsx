import React, { useState } from 'react';
import { Brain, CheckCircle, ChevronRight, RefreshCw, Activity, ArrowRight, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const questions = [
  { id: 1, question: "What is the next number in the sequence: 2, 6, 12, 20, 30, ...?", options: ["38", "40", "42", "44"], answer: 2 },
  { id: 2, question: "If all 'A's are 'B's, and some 'B's are 'C's, which of the following MUST be true?", options: ["All 'A's are 'C's", "Some 'A's are 'C's", "Some 'C's are 'A's", "None of the above"], answer: 3 },
  { id: 3, question: "A bat and a ball cost Rs. 110 in total. The bat costs Rs. 100 more than the ball. How much does the ball cost?", options: ["Rs. 10", "Rs. 5", "Rs. 15", "Rs. 0"], answer: 1 },
  { id: 4, question: "Which word does not belong with the others?", options: ["Carrot", "Potato", "Tomato", "Apple"], answer: 3 },
  { id: 5, question: "If 5 machines take 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?", options: ["100 minutes", "5 minutes", "50 minutes", "10 minutes"], answer: 1 },
  { id: 6, question: "Look at this series: 36, 34, 30, 28, 24... What number should come next?", options: ["20", "22", "23", "26"], answer: 1 },
  { id: 7, question: "Oasis is to Sand as Island is to?", options: ["River", "Sea", "Water", "Waves"], answer: 2 },
  { id: 8, question: "1, 1, 2, 3, 5, 8, 13, ? - What comes next in the Fibonacci sequence?", options: ["20", "21", "22", "23"], answer: 1 },
  { id: 9, question: "In a race, if you overtake the person in second place, what place are you in?", options: ["First", "Second", "Third", "Fourth"], answer: 1 },
  { id: 10, question: "If 'CAT' is coded as 3120, how is 'DOG' coded?", options: ["4157", "4147", "4158", "4167"], answer: 0 },
];

const TOTAL_QUESTIONS = questions.length; // 10

const IQScoreTest = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(new Array(TOTAL_QUESTIONS).fill(null));
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (idx) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = idx;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishTest = () => {
    // Check if all questions are answered
    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0) {
      return; // Don't finish if not all questions answered
    }

    let correct = 0;
    answers.forEach((ans, idx) => {
      if (ans === questions[idx].answer) correct++;
    });
    // Standardized IQ Scoring:
    // Uses a normalized scale mapped to standard IQ distribution
    // 0 correct = 55 (Very Low), 5 correct = 100 (Average), 10 correct = 155 (Exceptional)
    // Formula: baseIQ + (correct / totalQuestions) * scaleFactor
    const baseIQ = 55;
    const scaleFactor = 100;
    const iqScore = Math.round(baseIQ + (correct / TOTAL_QUESTIONS) * scaleFactor);
    setScore(iqScore);
    setIsFinished(true);
  };

  const resetTest = () => {
    setAnswers(new Array(TOTAL_QUESTIONS).fill(null));
    setCurrentQuestion(0);
    setIsFinished(false);
    setScore(0);
  };

  const handleApplyScore = () => {
    // Navigate to add-student with IQ score as query param
    navigate(`/add-student?iq_score=${score}`);
  };

  const getCorrectCount = () => {
    return Math.round(((score - 55) / 100) * TOTAL_QUESTIONS);
  };

  // Check if all questions have been answered
  const allAnswered = answers.every(a => a !== null);
  const unansweredCount = answers.filter(a => a === null).length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-64 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <Brain className="text-blue-600" size={28} />
              O/L Student IQ Assessment
            </h1>
            <p className="text-slate-500 text-sm mt-1">10-Question Cognitive & Logic Test designed for Sri Lankan O/L Students.</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium text-sm">
            <Activity size={18} />
            <span>Standard Score: 55 - 155</span>
          </div>
        </header>

        <main className="p-8 max-w-4xl mx-auto w-full">
          {!isFinished ? (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all">
              {/* Progress */}
              <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {Math.round(((currentQuestion) / questions.length) * 100)}% Completed
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 w-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 ease-out rounded-r-full" 
                  style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Number Dots */}
              <div className="px-8 pt-5 flex gap-2 flex-wrap">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-200 ${
                      idx === currentQuestion
                        ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-600/30'
                        : answers[idx] !== null
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Question */}
              <div className="p-8">
                <h2 className="text-2xl font-semibold text-slate-800 mb-8 leading-snug">
                  {questions[currentQuestion].question}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questions[currentQuestion].options.map((opt, idx) => {
                    const isSelected = answers[currentQuestion] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={`text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-md' 
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="font-medium text-lg">{opt}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-400'
                        }`}>
                          {isSelected && <CheckCircle size={14} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center rounded-b-2xl">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 hover:bg-slate-200"
                >
                  Previous Step
                </button>
                
                {currentQuestion === questions.length - 1 ? (
                  <div className="flex flex-col items-end gap-2">
                    {!allAnswered && (
                      <span className="text-xs text-amber-600 font-medium">
                        ⚠️ {unansweredCount} question{unansweredCount > 1 ? 's' : ''} unanswered
                      </span>
                    )}
                    <button
                      onClick={finishTest}
                      disabled={!allAnswered}
                      title={!allAnswered ? `Please answer all ${unansweredCount} remaining questions before submitting` : 'Calculate your IQ score'}
                      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                      Calculate My IQ
                      <Award size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="flex items-center gap-2 px-8 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium shadow-md shadow-slate-800/20 hover:bg-slate-900 transition-all"
                  >
                    Next Question
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="text-blue-600" size={48} />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Test Completed!</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Your logical reasoning and problem-solving abilities have been analyzed based on the standard 10-question O/L curriculum framework.
              </p>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 mb-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
                <p className="text-slate-300 text-sm font-medium uppercase tracking-widest mb-2">Estimated IQ Score</p>
                <div className="flex justify-center items-end gap-2 text-white">
                  <span className="text-7xl font-black tabular-nums tracking-tighter shadow-black drop-shadow-lg">{score}</span>
                  <span className="text-slate-400 font-medium mb-2">IQ</span>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10 flex justify-between text-left text-sm">
                  <div>
                    <span className="text-slate-400 block mb-1">Correct Answers</span>
                    <span className="text-white font-semibold text-lg drop-shadow">{getCorrectCount()} / {questions.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Performance Level</span>
                    <span className="text-white font-semibold text-lg drop-shadow">
                      {score >= 130 ? 'Gifted (Top 2%)' : score >= 115 ? 'Above Average' : score >= 85 ? 'Average' : 'Below Average'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info about auto-fill */}
              <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl text-left">
                <p className="text-emerald-800 font-semibold text-sm flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600" />
                  Your IQ score of <span className="text-emerald-600 font-bold">{score}</span> will be automatically filled in the Student Registration Form.
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetTest}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw size={18} />
                  Retake Test
                </button>
                <button
                  onClick={handleApplyScore}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all"
                >
                  Apply Score to Profile
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default IQScoreTest;
