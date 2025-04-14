// src/components/CodeEditor.js
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const CodeEditor = () => {
  const [code, setCode] = useState('// Write your code here');
  const [output, setOutput] = useState('');

  const handleClick = async (type) => {
    const promptMap = {
      debug: `Debug the following code:\n\n${code}`,
      explain: `Explain what this code does:\n\n${code}`,
      optimize: `Optimize the following code:\n\n${code}`,
    };

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: promptMap[type] }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      setOutput(response.data.choices[0].message.content);
    } catch (err) {
      setOutput('Error fetching AI response.');
      console.error(err);
    }
  };

  return (
    <div>
      <Editor
        height="50vh"
        defaultLanguage="javascript"
        defaultValue={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
      />
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => handleClick('debug')}>Debug</button>
        <button onClick={() => handleClick('explain')}>Explain</button>
        <button onClick={() => handleClick('optimize')}>Optimize</button>
      </div>
      <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
        <strong>AI Response:</strong>
        <p>{output}</p>
      </div>
    </div>
  );
};

export default CodeEditor;
