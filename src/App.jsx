import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';



const text = `This is a great start to your resume, Simon! Your experience in the field of machine learning and data analysis is well-detailed and shows a solid trajectory in your career. However, there are a few minor adjustments I'd like to suggest for clarity and accuracy:\n\n- Django React JS, Celery Docker => Django, ReactJS, Celery, Docker\n- Informatics Modules: Python, Matlab, Web => Informatics Modules: Python, MATLAB, Web Development\n- Bachelor’s degree Economics and Mathematics => Bachelor's Degree in Economics and Mathematics\n- Paper Publication - Diagnosis of giant cell arteritis with Deep Learning => Research Publication: Diagnosis of Giant Cell Arteritis Using Deep Learning\n\nNow, let's grade each part of the resume:\n\n1. Contact Information: A\nEverything is clearly listed and easily accessible. Great job here!\n\n2. Experience: A-\nVery impressive work experience! Consider using bullet points consistently for all job descriptions to improve readability.\n\n3. Education: A\nYour educational background is relevant and well-presented. Just make sure to maintain consistency in the formatting (e.g., capitalization and degree titles).\n\n4. Skills: B+\nYour skills are relevant and well-suited for the positions you're interested in. Consider separating 'Software' and 'Machine Learning' into different categories for clearer distinction.\n\n5. Side Projects: B\nFor 'Side Projects,' provide a bit more detail or context. For instance:\n- Summarize podcasts and books with GPT-3 + Whisper => Developed a summarization tool using GPT-3 and Whisper for podcasts and books\n- Pynanote => (Provide a brief description if Pynanote is a project or tool you created or contributed to)\n\nLastly, while not listed as a category, the overall formatting could use a slight polish. Align dates properly and ensure that the spacing between sections is consistent.\n\nRemember to tailor your resume for each job application to highlight the most relevant experience and skills for the position. You're on a strong path, Simon, and with these minor tweaks, your resume will be even more effective at showcasing your professional strengths. Keep up the good work!`

const ResumeUploader = () => {
  const [resume, setResume] = useState(null);
  const [reviewMarkdown, setReviewMarkdown] = useState('');
  const backgroundColor = '#f7fafc'; // Tailwind's cool gray 100, change as needed
  const [isLoading, setIsLoading] = useState(false);
  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const uploadResume = async () => {
    setIsLoading(true); // Start loading
    setReviewMarkdown("Loading... This could take 20-30 seconds.")
    const formData = new FormData();
    formData.append('image', resume);

    fetch('https://simonmoisselin--resume-v1-review-resume.modal.run', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        const reader = response.body.getReader();
        let decoder = new TextDecoder();
        let buffer = "";

        function processStream({ done, value }) {
          if (done) {
            setIsLoading(false); // Stop loading when the stream is complete
            return;
          }

          // Decode stream chunks and add to buffer
          buffer += decoder.decode(value, { stream: true });

          // Check for the end of the chunk
          let newlineIndex = buffer.indexOf("\n\n");
          while (newlineIndex !== -1) {
            let chunk = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 2);
            setReviewMarkdown((prevMarkdown) => prevMarkdown + chunk);
            newlineIndex = buffer.indexOf("\n\n");
          }

          // Continue reading the stream
          reader.read().then(processStream);
        }

        // Start processing the stream
        reader.read().then(processStream);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error('Error uploading file:', error);
        setReviewMarkdown(error)
        // Handle the error state as needed
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
          accept=".jpg, .jpeg, .png"
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
        <h2 className="text-3xl font-semibold mb-4">Feedback</h2>
        <div className="markdown bg-white p-6 rounded shadow h-auto overflow-auto custom-markdown">
          <ReactMarkdown>{reviewMarkdown || "Your resume feedback will appear here..."}</ReactMarkdown>
        </div>
      </div>

      <style>
        {`
        @keyframes loadProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}
      </style>
    </div>
  );
};

export default ResumeUploader;
