import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const ResumeUploader = () => {
  const [resume, setResume] = useState(null);
  const [reviewMarkdown, setReviewMarkdown] = useState('');
  const backgroundColor = '#f7fafc'; // This is Tailwind's cool gray 100, change as needed

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const uploadResume = async () => {
    const formData = new FormData();
    formData.append('resume', resume);

    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const markdown = await response.text();
        setReviewMarkdown(markdown);
      } else {
        console.error('Error uploading file:', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor }}>
      <h1 className="text-4xl font-bold mb-8">Resume Reviewer with AI</h1>
      <div className="w-full max-w-md p-6 border-2 border-dashed rounded-md bg-white shadow-md">
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          accept=".jpg, .jpeg, .pdf"
        />
        <button
          onClick={uploadResume}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 ease-in-out"
        >
          Upload Resume
        </button>
      </div>

      <div className="mt-8 w-full max-w-xl">
        {reviewMarkdown && (
          <div className="markdown bg-white p-4 rounded shadow">
            {/* Markdown content would be rendered here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;

