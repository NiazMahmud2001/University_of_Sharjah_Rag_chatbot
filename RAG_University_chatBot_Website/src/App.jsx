import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';

// Helper to truncate file names (first 10 characters + extension)
function truncateFileName(filename, maxLength = 10) {
  const dotIndex = filename.lastIndexOf('.');
  let namePart = filename;
  let extension = '';
  if (dotIndex !== -1) {
    namePart = filename.slice(0, dotIndex);
    extension = filename.slice(dotIndex);
  }
  if (namePart.length > maxLength) {
    namePart = namePart.slice(0, maxLength);
  }
  return namePart + extension;
}

const FileUpload = ({ onUpload }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          // Uncomment when your backend is ready:
          // const response = await axios.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          // onUpload(response.data);
          onUpload({ filename: file.name, filetype: file.type });
        } catch (error) {
          console.error('Upload error:', error);
        }
      }
    }
  });

  return (
    <div {...getRootProps()} className="upload-section">
      <input {...getInputProps()} />
      <p>+</p>
    </div>
  );
};

const ChatMessage = ({ message, isBot }) => (
  <div className={`message ${isBot ? 'bot-message' : 'user-message'}`}>
    <div dangerouslySetInnerHTML={{ __html: message }} />
  </div>
);

const ChatInterface = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Remove file from the uploadedFiles array by index
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuery = async () => {
    if (!inputText.trim()) return;

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { text: inputText, isBot: false }]);
      
      const link = "http://192.168.70.33:8709/askQuestion/";
      //const link = "http://172.29.11.5:8709/askQuestion/";

      const response = await axios.post(link, { 
        query: inputText,
        isChat: true 
      });
      setMessages(prev => [...prev, { text: response.data.answer, isBot: true }]);
    } catch (error) {
      console.error('Query error:', error);
      setMessages(prev => [...prev, { text: 'Error processing request', isBot: true }]);
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg.text} isBot={msg.isBot} />
        ))}
        {isLoading && (
          <div className="typing-indicator">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        )}
      </div>
      <div className="input-container">
        <div className="wrapperConteiner">
          {/* Display uploaded file names above the text input */}
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files-display">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{truncateFileName(file.filename)}</span>
                  <button className="remove-file-btn" onClick={() => removeFile(index)}>x</button>
                </div>
              ))}
            </div>
          )}
          <div className="topContainer">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
              className="input-field"
              placeholder="Type your question..."
              disabled={isLoading}
            />
            <button
              onClick={handleQuery}
              className="send-button"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
          <div className="bottomContainer">
            <FileUpload onUpload={(fileInfo) => setUploadedFiles(prev => [...prev, fileInfo])} />
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="app-container">
      <div className="main-content">
        <h1>My Experimental Rag Model</h1>
        <ChatInterface />
      </div>
    </div>
  );
};

export default App;
