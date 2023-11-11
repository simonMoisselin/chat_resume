import  { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import "./App.css"
import { inject } from '@vercel/analytics';

const explainResumeUrl = "https://simonmoisselin--resume-v1-review-resume.modal.run"
inject();
const ResumeUploader = () => {
  const [resume, setResume] = useState(null);
  const [reviewMarkdown, setReviewMarkdown] = useState("Feedback will appear here");
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
      .then((response) => {
        const reader = response.body.getReader();
        let decoder = new TextDecoder();
        function processStream({ done, value }) {
          if (done) {
            const textChunk = decoder.decode(value, { stream: true });
            setReviewMarkdown(current => current + textChunk);
            setIsLoading(false); // Stop loading when the stream is complete
            return;
          }
          // Decode stream chunks and add to buffer
          const textChunk = decoder.decode(value, { stream: true });
          setReviewMarkdown(current => current + textChunk)
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
        <h2 className="text-3xl font-semibold mb-4">Feedback</h2>
        <div className="markdown bg-white p-6 rounded shadow h-auto overflow-auto custom-markdown">
          <Markdown className="markdown" rehypePlugins={[rehypeHighlight]}  remarkPlugins={[remarkGfm]}>{reviewMarkdown || ""}</Markdown>
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
