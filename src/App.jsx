import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const ResumeUploader = () => {
  const [resume, setResume] = useState(null);
  const [reviewMarkdown, setReviewMarkdown] = useState('');
  const backgroundColor = '#f7fafc'; // Tailwind's cool gray 100, change as needed
  const [isLoading, setIsLoading] = useState(false);
  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const uploadResume = async () => {
    const formData = new FormData();
    formData.append('image', resume);
    // get bytes representation of resume not the buffer the real bytes
    const resumeBytes = await new Response(resume).arrayBuffer();
    // send image as a query param

    setIsLoading(true);
    try {
      const response = await fetch(`https://simonmoisselin--resume-v1-review-resume.modal.run?image=${resumeBytes}`, {
        method: 'POST',
      });
      setIsLoading(false);
      if (response.ok) {
        const markdown = await response.text();
        setReviewMarkdown(markdown);
      } else {
        console.error('Error uploading file:', response.statusText);
        setReviewMarkdown(response.statusText)
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setReviewMarkdown(error)
      setIsLoading(false);
    }
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
          accept=".jpg, .jpeg, .png"
        />
        <button
          disabled={isLoading}
          onClick={uploadResume}
          className={`w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 ease-in-out ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Upload Resume
        </button>
      </div>

      <div className="w-full max-w-xl">
        <div className="markdown bg-white p-4 rounded shadow h-64">
          {reviewMarkdown ? (
            <div dangerouslySetInnerHTML={{ __html: reviewMarkdown }} />
          ) : (
            <p className="text-gray-400">Your resume review will appear here...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUploader;
