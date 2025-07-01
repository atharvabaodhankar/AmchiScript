import { Token, TokenType, Literal, Program, Statement, Expression, PrintStatement } from './types';

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Program {
    while (this.check(TokenType.NEWLINE)) {
      this.advance();
    }
    this.consume(TokenType.CHALTI_START, 'Expected "chalti start" at the beginning of the program.');
    this.consume(TokenType.SEMICOLON, 'Expected ";" after "chalti start".');

    const body: Statement[] = [];
    while (!this.check(TokenType.BAS_KAR) && !this.isAtEnd()) {
      while (this.check(TokenType.NEWLINE)) {
        this.advance();
      }
      if (this.check(TokenType.BAS_KAR) || this.isAtEnd()) {
        break;
      }
      body.push(this.declaration());
    }

    this.consume(TokenType.BAS_KAR, 'Expected "bas kar" at the end of the program.');
    this.consume(TokenType.SEMICOLON, 'Expected ";" after "bas kar".');

    return { type: 'Program', body };
  }

  private declaration(): Statement {
    return this.statement();
  }

  private statement(): Statement {
    if (this.match(TokenType.DAKHAVA)) {
      return this.printStatement();
    }
    throw new Error(`Parse Error at line ${this.peek().line}, column ${this.peek().column}: Expected statement.`);
  }

  private printStatement(): PrintStatement {
    const expressions: Expression[] = [];
    do {
      expressions.push(this.expression());
    } while (this.match(TokenType.COMMA));
    this.consume(TokenType.SEMICOLON, 'Expected ";" after print statement.');
    return { type: 'PrintStatement', expressions };
  }

  private expression(): Expression {
    // For now, let's just handle identifiers, strings, and numbers
    if (this.match(TokenType.IDENTIFIER)) {
      return { type: 'Identifier', name: this.previous().value } as Expression;
    }
    if (this.match(TokenType.STRING, TokenType.NUMBER)) {
      const token = this.previous();
      return { type: 'Literal', value: token.value, raw: token.value } as Literal;
    }
    throw new Error(`Parse Error at line ${this.peek().line}, column ${this.peek().column}: Expected expression.`);
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw new Error(`Parse Error at line ${this.peek().line}, column ${this.peek().column}: ${message}`);
  }
}