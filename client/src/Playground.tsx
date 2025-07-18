import React, { useState, useRef, FormEvent } from 'react';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';

const EXAMPLES = [
  {
    name: 'Hello World',
    code: `chala suru karu;
dakhava "Namaskar, AmchiScript!";
bas re ata;`
  },
  {
    name: 'Input Example',
    code: `chala suru karu;
heAhe name = "";
dakhava "Tuzhe naav kaay?";
name = ghye();
dakhava "Namaskar, ", name, "!";
bas re ata;`
  },
  {
    name: 'If/Else',
    code: `chala suru karu;
heAhe age = 18;
jar (age >= 18) {
  dakhava "Adult";
} nahitar {
  dakhava "Not an adult";
}
bas re ata;`
  }
];

export default function Playground() {
  const [code, setCode] = useState<string>(EXAMPLES[1].code);
  const [output, setOutput] = useState<string>('');
  const [waitingForInput, setWaitingForInput] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const inputResolveRef = useRef<((value: string) => void) | null>(null);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Handler for interpreter output
  const handleOutput = (msg: string) => {
    setOutput((prev) => prev + msg + '\n');
  };

  // Handler for interpreter input (ghye)
  const handleInput = () => {
    setWaitingForInput(true);
    return new Promise<string>((resolve) => {
      inputResolveRef.current = resolve;
    });
  };

  // When user submits input
  const handleInputSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = (e.currentTarget.elements.namedItem('input') as HTMLInputElement).value;
    setWaitingForInput(false);
    setOutput((prev) => prev + '> ' + value + '\n');
    if (inputResolveRef.current) {
      inputResolveRef.current(value);
      inputResolveRef.current = null;
    }
    e.currentTarget.reset();
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
      await interpreter.interpret(ast);
    } catch (err: any) {
      setOutput((prev) => prev + (err.message || String(err)) + '\n');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' : 'bg-gradient-to-br from-white via-gray-50 to-gray-200 text-gray-900'}`}>
      <header className="w-full py-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-extrabold tracking-tight text-blue-800 dark:text-yellow-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.10)]">AmchiScript</span>
          <span className="rounded-full px-3 py-1 text-xs font-bold bg-yellow-300 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200 ml-2 shadow drop-shadow-[0_1px_4px_rgba(0,0,0,0.10)]">BETA</span>
        </div>
        <p className={`max-w-xl text-center text-lg font-medium mt-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          <span className={`font-bold ${theme === 'dark' ? 'text-yellow-200' : 'text-blue-700'}`}>AmchiScript</span> is a fun, beginner-friendly programming language inspired by Marathi! Try out code, play with variables, and see instant results below.
        </p>
        <div className="flex gap-2 mt-2">
          <button
            className={`px-3 py-1 rounded-full font-semibold border transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-800 border-yellow-400 text-yellow-200 hover:bg-yellow-900' : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-100 shadow'}`}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <label className="font-semibold text-base">Code Editor</label>
              <select
                className="ml-auto px-2 py-1 rounded border text-sm bg-white dark:bg-gray-800 dark:text-white border-blue-200 dark:border-gray-700 focus:outline-none"
                onChange={e => setCode(EXAMPLES[parseInt(e.target.value)].code)}
                value={EXAMPLES.findIndex(ex => ex.code === code)}
              >
                {EXAMPLES.map((ex, i) => (
                  <option value={i} key={ex.name}>{ex.name}</option>
                ))}
              </select>
            </div>
            <textarea
              className={`w-full min-h-[20rem] max-h-[40rem] p-3 rounded-lg border font-mono text-base shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-y ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-yellow-100' : 'bg-white border-gray-300 text-gray-900 shadow-md'}`}
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
            />
            <div className="flex gap-2 mt-2">
              <button
                className={`flex-1 py-2 rounded-lg font-bold text-lg shadow transition-colors duration-200 ${waitingForInput ? 'opacity-60 cursor-not-allowed' : theme === 'dark' ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                onClick={runCode}
                disabled={waitingForInput}
              >
                ▶️ Run
              </button>
            </div>
          </div>
          <div className={`flex-1 flex flex-col gap-2 ${theme === 'dark' ? '' : ''}`}>            <label className="font-semibold text-base mb-1">Output</label>
            <div className={`flex-1 min-h-[20rem] max-h-[40rem] overflow-y-auto rounded-lg p-3 font-mono text-base whitespace-pre shadow border ${theme === 'dark' ? 'bg-gray-950 border-gray-700 text-green-200' : 'bg-gray-50 border-gray-300 text-green-700 shadow-md'}`}
              style={{ wordBreak: 'break-word' }}>
              {output || 'Output will appear here.'}
            </div>
            {waitingForInput && (
              <form onSubmit={handleInputSubmit} className="flex gap-2 mt-2">
                <input
                  name="input"
                  className={`flex-1 border rounded-lg p-2 font-mono text-base focus:outline-none focus:ring-2 ${theme === 'dark' ? 'bg-gray-900 border-yellow-400 text-yellow-100 focus:ring-yellow-400' : 'bg-white border-blue-400 text-gray-900 focus:ring-blue-400'}`}
                  placeholder="Enter input..."
                  autoFocus
                  autoComplete="off"
                />
                <button className={`px-4 py-2 rounded-lg font-bold transition-colors duration-200 ${theme === 'dark' ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' : 'bg-green-600 text-white hover:bg-green-700'}`} type="submit">
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>
        <footer className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8 opacity-80">
          Made with ❤️ for the Marathi coding community. | <span className="font-semibold">AmchiScript</span> Playground
        </footer>
      </main>
    </div>
  );
} 