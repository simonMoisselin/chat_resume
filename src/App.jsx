import  { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import "./App.css"
import { inject } from '@vercel/analytics';
import ResumeReport from "./components/ResumeReport/component";

const sampleData = {
  candidateName: "Jane Doe",
  date: "2024-05-25",
  overallScore: 85,
  sections: [
    {
      title: "Personal Information",
      strengths: ["Clearly presented contact information", "Consistent formatting and layout"],
      improvements: ["Consider adding a professional headshot", "Ensure all information is up-to-date"],
      score: 90
    },
    {
      title: "Professional Summary",
      strengths: ["Concise and impactful summary", "Highlights key skills and expertise"],
      improvements: ["Consider adding quantifiable achievements", "Tailor the summary to the target role"],
      score: 80
    },
    {
      title: "Work Experience",
      strengths: ["Detailed and relevant work history", "Quantified achievements and impact"],
      improvements: ["Consider using more action-oriented language", "Ensure consistency in formatting and structure"],
      score: 90
    },
    {
      title: "Education",
      strengths: ["Clearly presented educational background", "Relevant certifications and training"],
      improvements: ["Consider adding GPA or academic honors", "Highlight any relevant coursework or projects"],
      score: 85
    },
    {
      title: "Skills",
      strengths: ["Comprehensive list of technical skills", "Relevant soft skills mentioned"],
      improvements: ["Prioritize skills based on relevance to the job", "Consider listing proficiency levels"],
      score: 75
    }
  ]
};

const explainResumeUrl = "https://simonmoisselin--resume-v2-review-resume.modal.run"
inject();
const ResumeUploader = () => {
  const [resume, setResume] = useState(null);
  const [reviewMarkdown, setReviewMarkdown] = useState("Feedback will appear here");
  const [reportData, setReportData] = useState(null);
  const backgroundColor = '#f7fafc'; // Tailwind's cool gray 100, change as needed
  const [isLoading, setIsLoading] = useState(false);
  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const uploadResume = async () => {
    setIsLoading(true); // Start loading
    setReviewMarkdown(''); // Clear previous review

    const formData = new FormData();
    formData.append('image', resume, );

    fetch(explainResumeUrl, {
      method: 'POST',
      headers: {
        // Include the Authorization header with the Bearer token
        'Authorization': `Bearer ${import.meta.env.VITE_AUTH_TOKEN }`,
      },
      body: formData,
    })
    .then(res=>res.json())
      .then((response) => {
        // assuming we already have the response object
        // get the PromiseResult object
        console.log(response);
        console.log(response.PromiseResult);
        const returnedData = response;
        console.log(returnedData);
        setIsLoading(false);
        setReviewMarkdown(returnedData);

        setReportData(returnedData);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error('Error uploading file:', error);
        setReviewMarkdown(error)
      });
  };



  return (
    <div className="min-h-screen flex flex-col items-center pt-12" style={{ backgroundColor }}>
      <h1 className="text-4xl font-bold mb-8">Resume Reviewer with AI</h1>
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
      </div>

      <div className="w-full max-w-4xl">
        <h2 className="text-3xl font-semibold mb-4">Report</h2>
        <div className="markdown bg-white p-6 rounded shadow h-auto overflow-auto custom-markdown">
          <ResumeReport data={reportData} />
          {/* <Markdown className="markdown" rehypePlugins={[rehypeHighlight]}  remarkPlugins={[remarkGfm]}>{reviewMarkdown || ""}</Markdown> */}
        </div>
      </div>
      <footer className="w-full max-w-4xl mt-12 mb-4">
        <div className="text-center">
          <p className="text-lg">
            Hi, I am Simon Moisselin
          </p>
          <p className="text-lg">
            Follow me on <a href="https://www.youtube.com/channel/UCPTEKGB8JbLxdCj4BdPpb3Q?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">YouTube</a>
          </p>
          <p className="text-lg mt-2">
            For questions or partnerships, email me at <a href="mailto:simon.moisselin@gmail.com" className="text-blue-600 hover:underline">simon.moisselin@gmail.com</a>
          </p>
        </div>
      </footer>
    
    </div>
  );
};

export default ResumeUploader;
