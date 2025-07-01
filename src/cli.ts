import { Lexer } from './lexer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';
import { TokenType } from './types';

export function run(source: string) {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();

  const parser = new Parser(tokens);
  const ast = parser.parse();

  const interpreter = new Interpreter();
  interpreter.interpret(ast);
}

// This part will be handled by the CLI argument parsing
// For now, we'll keep the run function as is, and the main execution logic
// will be in index.ts or similar.