import { Lexer } from './lexer';
import { Parser } from './parser';
import { TokenType } from './types';

function run(source: string) {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();

  console.log('--- Tokens ---');
  tokens.forEach(token => console.log(`${TokenType[token.type].padEnd(20)} | "${token.value}" | Line ${token.line}, Col ${token.column}`));

  const parser = new Parser(tokens);
  const ast = parser.parse();

  console.log('\n--- AST ---');
  console.log(JSON.stringify(ast, null, 2));
}

// Example usage:
const program = `
chalti start;
bolta "Hello, AmchiScript!";
bas kar;
`;

run(program);