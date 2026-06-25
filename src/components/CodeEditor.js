// src/components/CodeEditor.js
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CodeEditor = () => {
  const [code, setCode] = useState('// Write your code here');
  const [output, setOutput] = useState('');
  const [activeAction, setActiveAction] = useState('');

  const handleClick = async (type) => {
    setActiveAction(type);
    setOutput('');

    try {
      const response = await axios.post(`${API_BASE_URL}/${type}`, {
        code,
        language: 'javascript',
      });

      setOutput(response.data.result);
    } catch (err) {
      setOutput(err.response?.data?.error || 'Error fetching AI response.');
      console.error(err);
    } finally {
      setActiveAction('');
    }
  };

  const isLoading = Boolean(activeAction);

  return (
    <div>
      <Editor
        height="50vh"
        defaultLanguage="javascript"
        defaultValue={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-dark"
      />
      <div style={{ marginTop: '1rem' }}>
        <button disabled={isLoading} onClick={() => handleClick('debug')}>
          {activeAction === 'debug' ? 'Debugging...' : 'Debug'}
        </button>
        <button disabled={isLoading} onClick={() => handleClick('explain')}>
          {activeAction === 'explain' ? 'Explaining...' : 'Explain'}
        </button>
        <button disabled={isLoading} onClick={() => handleClick('optimize')}>
          {activeAction === 'optimize' ? 'Optimizing...' : 'Optimize'}
        </button>
      </div>
      <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
        <strong>AI Response:</strong>
        <p>{output}</p>
      </div>
    </div>
  );
};

export default CodeEditor;
