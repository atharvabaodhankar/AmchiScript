import React, { useState, useRef } from 'react';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';

export default function Playground() {
  const [code, setCode] = useState(`chala suru karu;\nheAhe myVariable = "Hello, Variables!";\ndakhava myVariable;\nbas re ata;`);
  const [output, setOutput] = useState('');
  const [waitingForInput, setWaitingForInput] = useState(false);
  const inputResolveRef = useRef(null);

  // Handler for interpreter output
  const handleOutput = (msg) => {
    setOutput((prev) => prev + msg + '\n');
  };

  // Handler for interpreter input (ghye)
  const handleInput = () => {
    setWaitingForInput(true);
    return new Promise((resolve) => {
      inputResolveRef.current = resolve;
    });
  };

  // When user submits input
  const handleInputSubmit = (e) => {
    e.preventDefault();
    const value = e.target.elements.input.value;
    setWaitingForInput(false);
    setOutput((prev) => prev + '> ' + value + '\n');
    if (inputResolveRef.current) {
      inputResolveRef.current(value);
      inputResolveRef.current = null;
    }
    e.target.reset();
  };

  // Run AmchiScript code
  const runCode = async () => {
    setOutput('');
    setWaitingForInput(false);
    inputResolveRef.current = null;
    try {
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const interpreter = new Interpreter({
        input: handleInput,
        output: handleOutput,
      });
      // Support async evaluateCallExpression
      if (interpreter.interpret.constructor.name === 'AsyncFunction') {
        await interpreter.interpret(ast);
      } else {
        interpreter.interpret(ast);
      }
    } catch (err) {
      setOutput((prev) => prev + (err.message || String(err)) + '\n');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AmchiScript Playground</h1>
      <textarea
        className="w-full h-48 p-2 border rounded font-mono text-base mb-2"
        value={code}
        onChange={e => setCode(e.target.value)}
        spellCheck={false}
      />
      <div className="flex gap-2 mb-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={runCode}
          disabled={waitingForInput}
        >
          Run
        </button>
      </div>
      <div className="bg-gray-900 text-green-200 p-3 rounded h-40 overflow-y-auto font-mono whitespace-pre mb-2">
        {output || 'Output will appear here.'}
      </div>
      {waitingForInput && (
        <form onSubmit={handleInputSubmit} className="flex gap-2 mt-2">
          <input
            name="input"
            className="flex-1 border rounded p-2 font-mono"
            placeholder="Enter input..."
            autoFocus
            autoComplete="off"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" type="submit">
            Submit
          </button>
        </form>
      )}
    </div>
  );
} 