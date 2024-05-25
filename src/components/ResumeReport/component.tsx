import React from 'react';

interface SectionFeedback {
  title: string;
  strengths: string[];
  improvements: string[];
  score: number;
}

interface ResumeReportProps {
  candidateName: string;
  date: string;
  overallScore: number;
  sections: SectionFeedback[];
}

const ResumeReport: React.FC<ResumeReportProps> = ({ data }) => {


  if (!data) {
    return null;
  }
  const { candidateName, date, overallScore, sections } = data;
  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Resume Feedback Report</h1>
          <p className="text-gray-500 dark:text-gray-400">Candidate: {candidateName}</p>
          <p className="text-gray-500 dark:text-gray-400">Date: {date}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-4 py-2 rounded-full font-medium">
          Overall Score: {overallScore}/100
        </div>
      </div>
      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={index}>
            <h2 className="text-xl font-bold mb-2">{section.title}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Strengths:</p>
                <ul className="list-disc pl-4 text-gray-700 dark:text-gray-300">
                  {section.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Areas for Improvement:</p>
                <ul className="list-disc pl-4 text-gray-700 dark:text-gray-300">
                  {section.improvements.map((improvement, idx) => (
                    <li key={idx}>{improvement}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <div className={`px-4 py-2 rounded-full font-medium ${section.score >= 85 ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' : section.score >= 70 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'}`}>
                Score: {section.score}/100
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeReport;