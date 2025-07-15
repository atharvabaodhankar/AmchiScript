import { Token, TokenType, Program, Statement, VarDeclaration, Expression, PrintStatement, Literal, Identifier, IfStatement, BlockStatement, BinaryExpression } from './types';

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
    this.consume(TokenType.CHALA_SURU_KARU, 'Expected "chala suru karu" at the beginning of the program.');
    this.consume(TokenType.SEMICOLON, 'Expected ";" after "chala suru karu".');

    const body: Statement[] = [];
    while (!this.check(TokenType.BAS_RE_ATA) && !this.isAtEnd()) {
      while (this.check(TokenType.NEWLINE)) {
        this.advance();
      }
      if (this.check(TokenType.BAS_RE_ATA) || this.isAtEnd()) {
        break;
      }
      body.push(this.declaration());
    }

    this.consume(TokenType.BAS_RE_ATA, 'Expected "bas re ata" at the end of the program.');
    this.consume(TokenType.SEMICOLON, 'Expected ";" after "bas re ata".');

    return { type: 'Program', body };
  }

  private declaration(): Statement {
    if (this.match(TokenType.HE_AHE)) {
      return this.varDeclaration();
    }
    // Look ahead for assignment: IDENTIFIER ASSIGN ...
    if (this.check(TokenType.IDENTIFIER) && this.checkNext(TokenType.ASSIGN)) {
      return this.assignmentStatement();
    }
    return this.statement();
  }

  private varDeclaration(): VarDeclaration {
    const name = this.consume(TokenType.IDENTIFIER, 'Expected variable name.').value;
    let initializer: Expression | null = null;
    if (this.match(TokenType.ASSIGN)) {
      initializer = this.expression();
    }
    this.consume(TokenType.SEMICOLON, 'Expected ";" after variable declaration.');
    return { type: 'VarDeclaration', name, initializer };
  }

  private statement(): Statement {
    if (this.match(TokenType.DAKHAVA)) {
      return this.printStatement();
    }
    if (this.match(TokenType.JAR)) {
      return this.ifStatement();
    }
    if (this.match(TokenType.PUNHA_KAR)) {
      return this.whileStatement();
    }
    throw new Error(`Parse Error at line ${this.peek().line}, column ${this.peek().column}: Expected statement.`);
  }

  private ifStatement(): IfStatement {
    this.consume(TokenType.LPAREN, 'Expected \'(\' after \'jar\'.');
    const condition = this.expression();
    this.consume(TokenType.RPAREN, 'Expected \'\)\' after if condition.');

    this.consume(TokenType.LBRACE, 'Expected \'{\' before if block.');
    const consequent: Statement[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      consequent.push(this.declaration());
    }
    this.consume(TokenType.RBRACE, 'Expected } after if block.');

    let alternate: Statement | undefined;
    if (this.match(TokenType.NAHITAR_JAR)) {
      alternate = this.ifStatement(); // else if
    } else if (this.match(TokenType.NAHITAR)) {
      this.consume(TokenType.LBRACE, 'Expected \'{\' before else block.');
      const elseBody: Statement[] = [];
      while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
        elseBody.push(this.declaration());
      }
      this.consume(TokenType.RBRACE, 'Expected } after else block.');
      alternate = { type: 'BlockStatement', body: elseBody };
    }

    return { type: 'IfStatement', condition, consequent: { type: 'BlockStatement', body: consequent }, alternate };
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
    return this.equality();
  }

  private equality(): Expression {
    let expr = this.comparison();
    while (this.match(TokenType.EQUAL, TokenType.NOT_EQUAL)) {
      const operator = this.previous().value;
      const right = this.comparison();
      expr = { type: 'BinaryExpression', left: expr, operator, right } as BinaryExpression;
    }
    return expr;
  }

  private comparison(): Expression {
    let expr = this.term();
    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const operator = this.previous().value;
      const right = this.term();
      expr = { type: 'BinaryExpression', left: expr, operator, right } as BinaryExpression;
    }
    return expr;
  }

  private term(): Expression {
    let expr = this.factor();
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous().value;
      const right = this.factor();
      expr = { type: 'BinaryExpression', left: expr, operator, right } as BinaryExpression;
    }
    return expr;
  }

  private factor(): Expression {
    let expr = this.unary();
    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
      const operator = this.previous().value;
      const right = this.unary();
      expr = { type: 'BinaryExpression', left: expr, operator, right } as BinaryExpression;
    }
    return expr;
  }

  private unary(): Expression {
    if (this.match(TokenType.MINUS, TokenType.NOT_EQUAL)) {
      const operator = this.previous().value;
      const right = this.unary();
      return { type: 'UnaryExpression', operator, argument: right };
    }
    return this.primary();
  }

  private primary(): Expression {
    if (this.match(TokenType.KHARA)) return { type: 'Literal', value: true, raw: 'khara' } as Literal;
    if (this.match(TokenType.KHOTA)) return { type: 'Literal', value: false, raw: 'khota' } as Literal;
    if (this.match(TokenType.RIKAM)) return { type: 'Literal', value: null, raw: 'rikam' } as Literal;

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      const token = this.previous();
      return { type: 'Literal', value: token.value, raw: token.value } as Literal;
    }

    if (this.match(TokenType.IDENTIFIER)) {
      const id = { type: 'Identifier', name: this.previous().value } as Identifier;
      if (this.match(TokenType.LPAREN)) {
        const args: Expression[] = [];
        if (!this.check(TokenType.RPAREN)) {
          do {
            args.push(this.expression());
          } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RPAREN, 'Expected ")" after function arguments.');
        return { type: 'CallExpression', callee: id, arguments: args };
      }
      return id;
    }

    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RPAREN, 'Expected ")" after expression.');
      return expr;
    }

    throw new Error(`Parse Error at line ${this.peek().line}, column ${this.peek().column}: Expected expression.`);
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(offset = 1): Token {
    return this.tokens[this.current - offset];
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

  private checkNext(type: TokenType): boolean {
    if (this.current + 1 >= this.tokens.length) return false;
    return this.tokens[this.current + 1].type === type;
  }

  private assignmentStatement(): Statement {
    console.log('DEBUG: Entering assignmentStatement at token:', this.peek());
    const identifier = this.consume(TokenType.IDENTIFIER, 'Expected variable name.').value;
    this.consume(TokenType.ASSIGN, 'Expected "=" in assignment.');
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, 'Expected ";" after assignment.');
    console.log('DEBUG: Exiting assignmentStatement at token:', this.peek());
    return { type: 'Assignment', identifier, value };
  }

  private whileStatement(): Statement {
    console.log('DEBUG: Entering whileStatement at token:', this.peek());
    this.consume(TokenType.LPAREN, 'Expected "(" after while keyword.');
    const condition = this.expression();
    this.consume(TokenType.RPAREN, 'Expected ")" after while condition.');
    this.consume(TokenType.LBRACE, 'Expected "{" before while body.');
    const body: Statement[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      console.log('DEBUG: whileStatement body, current token:', this.peek());
      body.push(this.declaration());
    }
    this.consume(TokenType.RBRACE, 'Expected "}" after while body.');
    console.log('DEBUG: Exiting whileStatement at token:', this.peek());
    return { type: 'WhileStatement', condition, body: { type: 'BlockStatement', body } };
  }
}