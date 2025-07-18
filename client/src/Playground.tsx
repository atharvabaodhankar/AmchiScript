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

// Helper for copyable code block
function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="relative group my-2">
      <pre className="bg-yellow-100/90 dark:bg-yellow-900/80 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 mb-2 font-mono overflow-x-auto whitespace-pre-wrap shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-yellow-300 dark:group-hover:ring-yellow-500 text-white">
        {code}
      </pre>
      <button
        className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded-md text-xs font-semibold shadow hover:bg-yellow-300 dark:hover:bg-yellow-600 transition-all opacity-90 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        aria-label="Copy code"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

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


          {/* About AmchiScript Section */}
          <div className="max-w-3xl mx-auto mt-12 mb-10 p-8 rounded-2xl bg-yellow-50/90 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 shadow-lg text-left">
            <h2 className="text-2xl font-extrabold text-yellow-700 dark:text-yellow-300 mb-2">About AmchiScript</h2>
            <p className="mb-4 text-gray-800 dark:text-gray-100 text-base">
              <span className="font-bold text-yellow-800 dark:text-yellow-200">AmchiScript</span> is a beginner-friendly, Marathi-inspired programming language designed to make coding fun and accessible for everyone. Its syntax is simple, expressive, and uses familiar Marathi words for programming concepts. Whether you're new to coding or want to explore a language in your mother tongue, AmchiScript is for you!
            </p>
            <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-200 mt-6 mb-2">Key Features</h3>
            <ul className="list-disc pl-6 text-gray-800 dark:text-gray-100 text-sm space-y-1 mb-4">
              <li>Marathi-inspired keywords and syntax</li>
              <li>Easy-to-read, beginner-friendly structure</li>
              <li>Supports variables, input/output, conditionals, loops, and functions</li>
              <li>Great for learning, teaching, and having fun with code!</li>
            </ul>
            <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-200 mt-6 mb-2">Language Guide</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">Program Structure:</span>
                <CopyableCode code={`chala suru karu;\n...\nbas re ata;`} />
                <span className="text-gray-700 dark:text-gray-100">Every program starts with <code>chala suru karu;</code> and ends with <code>bas re ata;</code>.</span>
              </div>
              <div>
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">Variables:</span>
                <CopyableCode code={`heAhe x = 5;`} />
                <span className="text-gray-700 dark:text-gray-100">Declare variables using <code>heAhe</code>.</span>
              </div>
              <div>
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">Print Output:</span>
                <CopyableCode code={`dakhava "Hello, World!";`} />
                <span className="text-gray-700 dark:text-gray-100">Use <code>dakhava</code> to print to the output.</span>
              </div>
              <div>
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">Input:</span>
                <CopyableCode code={`heAhe name = "";\nname = ghye();`} />
                <span className="text-gray-700 dark:text-gray-100">Use <code>ghye()</code> to get user input.</span>
              </div>
              <div>
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">If/Else:</span>
                <CopyableCode code={`jar (x > 5) { ... } nahitar { ... }`} />
                <span className="text-gray-700 dark:text-gray-100">Conditional logic with <code>jar</code> (if) and <code>nahitar</code> (else).</span>
              </div>
              <div>
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">Loops:</span>
                <CopyableCode code={`punha kar (x < 10) { ... }`} />
                <span className="text-gray-700 dark:text-gray-100">Repeat code with <code>punha kar</code> (while loop).</span>
              </div>
              <div>
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">Functions:</span>
                <CopyableCode code={`kaamkar add(a, b) { ... }`} />
                <span className="text-gray-700 dark:text-gray-100">Define functions with <code>kaamkar</code>.</span>
              </div>
              <div>
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">Comments:</span>
                <CopyableCode code={`// This is a comment`} />
                <span className="text-gray-700 dark:text-gray-100">Use <code>//</code> for single-line comments.</span>
              </div>
              <div>
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">Operators & Data Types:</span>
                <CopyableCode code={'+, -, *, /, %, >, <, >=, <=, ==, !=, ani (and), kimva (or), nahi (not)\nNumbers, Strings, Booleans (khara/khota), Null (rikam)'} />
                <span className="text-gray-700 dark:text-gray-100">Supports arithmetic, comparison, and logical operators. Data types: numbers, strings, booleans, null.</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600 dark:text-gray-300">See <a href="https://github.com/atharvabaodhankar/AmchiScript" target="_blank" rel="noopener noreferrer" className="underline text-yellow-800 dark:text-yellow-200 font-semibold">README</a> for full documentation and more examples.</div>
          </div>

          {/* Creator Section */}
          <div className="text-center text-base font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Created &amp; maintained by Atharva Baodhankar</div>

          <div className="flex flex-col items-center mt-4">
            {/* Premium Glassmorphism Dev Card - Yellow Themed */}
            <div className="relative w-full max-w-md rounded-3xl p-0.5 bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-400 shadow-2xl group transition-all duration-300">
              <div className="rounded-[22px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-8 flex flex-col items-center relative z-10 border-2 border-yellow-300">
                <div className="h-[96px] w-[96px] mb-4 rounded-full border-4 border-yellow-300/40 shadow-lg overflow-hidden bg-gradient-to-br from-yellow-100/60 to-yellow-200/30 flex items-center justify-center">
                  <img className="w-full h-full object-cover" alt="Atharva Baodhankar" src="https://www.polystudi.com/assets/Atharva-0sii5WUc.jpg" />
                </div>
                <h3 className="text-xl font-bold leading-tight font-baumans text-yellow-700 dark:text-yellow-200 mb-1 tracking-tight">Atharva Baodhankar</h3>
                <h4 className="text-base text-yellow-600 dark:text-yellow-300 font-poppins mb-2 font-semibold">Web Designer & Developer</h4>
                <p className="text-gray-700 dark:text-gray-200 text-sm font-poppins mb-4 max-w-xs">I bring sites to life with clean, user-friendly interfaces and captivating animations. 50+ websites built. Always learning, always innovating.</p>
                <div className="flex justify-center gap-3 mt-2 mb-4">
                  <a href="https://github.com/atharvabaodhankar" className="w-9 h-9 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-300 hover:text-yellow-900 transition-all shadow" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 496 512" className="text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"></path></svg>
                  </a>
                  <a href="https://www.instagram.com/op_athu_/" className="w-9 h-9 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-300 hover:text-yellow-900 transition-all shadow" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path></svg>
                  </a>
                  <a href="mailto:baodhankaratharva@gmail.com" className="w-9 h-9 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-300 hover:text-yellow-900 transition-all shadow" aria-label="Email">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"></path></svg>
                  </a>
                  <a href="https://atharvabaodhankar.github.io/portfolio/" className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-yellow-300 text-yellow-700 hover:bg-yellow-300 hover:text-yellow-900 transition-all shadow" aria-label="Portfolio" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75A2.25 2.25 0 0014.25 4.5h-4.5A2.25 2.25 0 007.5 6.75v10.5A2.25 2.25 0 009.75 19.5h4.5a2.25 2.25 0 002.25-2.25V13.5m-6.75 0h9m0 0l-2.25-2.25M16.5 13.5l-2.25 2.25" /></svg>
                  </a>
                </div>
                <a href="https://github.com/atharvabaodhankar/AmchiScript" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-2 rounded-full bg-yellow-400 text-yellow-900 font-bold hover:scale-105 transition-all duration-200 shadow-lg mt-2">AmchiScript GitHub Repo</a>
              </div>
            </div>
            {/* Contribution Footer */}
            <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-300">
              <div className="mb-2 font-semibold">Want to contribute to AmchiScript?</div>
              <a href="https://github.com/atharvabaodhankar/AmchiScript" target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-yellow-900 font-bold hover:scale-105 transition-all duration-200 shadow-md">Contribute on GitHub</a>
              <div className="mt-2 text-xs opacity-70">Open source & community-driven. PRs and stars welcome!</div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
} 