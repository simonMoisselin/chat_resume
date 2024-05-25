import React from 'react';

interface SectionFeedback {
  title: string;
  strengths: string[];
  improvements: string[];
  score: number;
  detailedComments: string;
}

interface Recommendation {
  content: string;
  importance: number;
  difficulty: number;
}

interface ActionPlanItem {
  action: string;
  deadline: string;
}

interface ResumeReportProps {
  data: {
    candidateName: string;
    date: string;
    overallScore: number;
    sections: SectionFeedback[];
    candidateEmail: string;
    recommendations: Recommendation[];
    summary: string;
    actionPlan: ActionPlanItem[];
  };
}

const ResumeReport: React.FC<ResumeReportProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  const {
    candidateName,
    date,
    overallScore,
    sections,
    candidateEmail,
    recommendations,
    summary,
    actionPlan,
  } = data;

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Candidate: {candidateName}</p>
          <p className="text-gray-500 dark:text-gray-400">Date: {date}</p>
          {/* make the email clickable */}
          <a href={`mailto:${candidateEmail}`} className="text-blue-500 dark:text-blue-400 hover:underline">
            {candidateEmail}
          </a>
        </div>
        <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-4 py-2 rounded-full font-medium">
          Overall Score: {overallScore}/100
        </div>
      </div>

      {/* New section for personalized learning curriculum */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">Personalized Learning Curriculum</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Take your career to the next level with a personalized learning curriculum tailored to your resume review. 
          Our AI-driven service will create a comprehensive learning plan based on your unique strengths and areas for 
          improvement, ensuring you achieve your professional goals efficiently and effectively.
        </p>
        <h3 className="text-lg font-bold">Why Choose Our Personalized Learning Curriculum?</h3>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
          <li><strong>Tailored Recommendations:</strong> Receive a curriculum designed specifically for you, targeting the skills and knowledge you need to advance.</li>
          <li><strong>Expert Guidance:</strong> Benefit from expert advice and resources selected to match your career aspirations.</li>
          <li><strong>Achieve Your Goals:</strong> Accelerate your career progress with a focused, structured learning path.</li>
        </ul>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-full mt-4">
          Invest in Your Future Today! [Pay Now]
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold">Summary</h2>
        <p className="text-gray-700 dark:text-gray-300">{summary}</p>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Recommendations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded shadow-md">
              <p className="font-bold mb-2">{recommendation.content}</p>
              <div className="mb-2">
                <p>Importance:</p>
                <div className="h-4 bg-gray-200 rounded-full">
                  <div
                    className="h-4 bg-gray-500 rounded-full transition-all duration-500 ease-in-out"
                    style={{
                      width: `${recommendation.importance}%`,
                      opacity: recommendation.importance / 100,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <p>Difficulty:</p>
                <div className="h-4 bg-gray-200 rounded-full">
                  <div
                    className="h-4 bg-gray-500 rounded-full transition-all duration-500 ease-in-out"
                    style={{
                      width: `${recommendation.difficulty}%`,
                      opacity: recommendation.difficulty / 100,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
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
            <div className="mt-2">
              <p className="text-gray-500 dark:text-gray-400 mb-1">Detailed Comments:</p>
              <p className="text-gray-700 dark:text-gray-300">{section.detailedComments}</p>
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