import React, { useState, useEffect } from 'react';
import "./App.css";
import { inject } from '@vercel/analytics';
import ResumeReport from "./components/ResumeReport/component";

const explainResumeUrl = "https://simonmoisselin--resume-v2-review-resume.modal.run";
inject();

const steps = [
  { percentage: 10, text: "Extracting information from image and text..." },
  { percentage: 30, text: "Finding layout issues..." },
  { percentage: 50, text: "Finding typos..." },
  { percentage: 70, text: "Analyzing the content..." },
  { percentage: 90, text: "Finding more improvements..." },
  { percentage: 100, text: "Finalizing..." },
];

const ResumeUploader = () => {
  const [resume, setResume] = useState(null);
  const [reportData, setReportData] = useState(null);
  const backgroundColor = '#f7fafc'; // Tailwind's cool gray 100, change as needed
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState(steps[0].text);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const nextProgress = prev + (100 / 18);
          const currentStep = steps.find(step => nextProgress <= step.percentage);
          setStepText(currentStep ? currentStep.text : steps[steps.length - 1].text);
          if (nextProgress >= 100) {
            clearInterval(interval);
          }
          return nextProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const uploadResume = async () => {
    setIsLoading(true); // Start loading
    setProgress(0); // Reset progress

    const formData = new FormData();
    formData.append('image', resume);

    fetch(explainResumeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_AUTH_TOKEN}`,
      },
      body: formData,
    })
    .then(res => res.json())
    .then((response) => {
      console.log(response);
      const returnedData = response;
      setIsLoading(false);
      setReportData(returnedData);
    })
    .catch((error) => {
      setIsLoading(false);
      console.error('Error uploading file:', error);
      setReportData(null);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-12" style={{ backgroundColor }}>
      <h1 className="text-4xl font-bold mb-8">Resume Report & Evaluation</h1>
      <h2 className="text-2xl font-semibold mb-4">Upload your resume to get a free report</h2>
      <div className="w-full max-w-md p-6 border-2 border-dashed rounded-md bg-white shadow-md mb-8">
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          accept=".jpg, .jpeg, .png, .pdf"
        />
        <button
          disabled={!resume || isLoading}
          onClick={uploadResume}
          className={`w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 ease-in-out ${isLoading || !resume ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Review Resume
        </button>
        {isLoading && (
          <div className="mt-4 w-full">
            <div className="h-4 bg-gray-200 rounded-full">
              <div
                className="h-4 bg-blue-500 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{stepText}</p>
          </div>
        )}
      </div>

      {reportData && (
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between bg-white p-4 rounded shadow-md mb-8">
            <div className="text-gray-700 dark:text-gray-300">
              <h2 className="text-xl font-bold">Personalized Learning</h2>
              <p>Boost your career with a tailored learning plan.</p>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-full">
              Invest in Your Future! [Pay Now]
            </button>
          </div>

          <h2 className="text-3xl font-semibold mb-4">Report</h2>
          <div className="markdown bg-white p-6 rounded shadow h-auto overflow-auto custom-markdown">
            <ResumeReport data={reportData} />
          </div>
        </div>
      )}

      <footer className="w-full max-w-4xl mt-12 mb-4">
        <div className="text-center">
          <p className="text-lg">Hi, I am Simon Moisselin</p>
          <p className="text-lg">
            Follow me on <a href="https://www.youtube.com/channel/UCPTEKGB8JbLxdCj4BdPpb3Q?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">YouTube</a>
          </p>
          <p className="text-lg mt-2">
            Email me at <a href="mailto:simon.moisselin@gmail.com" className="text-blue-600 hover:underline">simon.moisselin@gmail.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ResumeUploader;