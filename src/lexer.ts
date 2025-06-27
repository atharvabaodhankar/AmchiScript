// src/lexer.ts

import { Token, TokenType } from './types';

export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  
  private keywords: Map<string, TokenType> = new Map([
    // Program Structure
    ['chalti', TokenType.CHALTI_START],
    ['start', TokenType.CHALTI_START],
    ['bas', TokenType.BAS_KAR],
    ['kar', TokenType.BAS_KAR],
    
    // Variables
    ['ahe', TokenType.AHE],
    ['set', TokenType.SET],
    
    // Literals
    ['khara', TokenType.KHARA],
    ['khota', TokenType.KHOTA],
    ['nahi', TokenType.NAHI],
    
    // Output
    ['bolta', TokenType.BOLTA],
    
    // Control Flow
    ['jar', TokenType.JAR],
    ['tar', TokenType.NAHI_TAR],
    ['otherwise', TokenType.OTHERWISE],
    ['joparyant', TokenType.JOPARYANT],
    ['pratyek', TokenType.PRATYEK],
    ['break', TokenType.BREAK_KAR],
    ['continue', TokenType.CONTINUE_KAR],
    
    // Functions
    ['function', TokenType.FUNCTION],
    ['return', TokenType.RETURN_KAR],
    
    // Logical
    ['ani', TokenType.ANI],
    ['kiva', TokenType.KIVA],
    ['nako', TokenType.NAKO],
  ]);

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (!this.isAtEnd()) {
      this.skipWhitespace();
      
      if (this.isAtEnd()) break;
      
      // Skip comments
      if (this.peek() === '/' && this.peekNext() === '/') {
        this.skipLineComment();
        continue;
      }
      
      if (this.peek() === '/' && this.peekNext() === '*') {
        this.skipBlockComment();
        continue;
      }
      
      const token = this.nextToken();
      if (token) {
        tokens.push(token);
      }
    }
    
    tokens.push(this.createToken(TokenType.EOF, ''));
    return tokens;
  }

  private nextToken(): Token | null {
    const char = this.peek();
    const startLine = this.line;
    const startColumn = this.column;

    // Handle multi-character keywords first
    if (this.isAlpha(char)) {
      return this.handleIdentifierOrKeyword();
    }

    // Single character tokens
    switch (char) {
      case '=':
        if (this.peekNext() === '=') {
          this.advance();
          this.advance();
          return this.createToken(TokenType.EQUAL, '==');
        }
        this.advance();
        return this.createToken(TokenType.ASSIGN, '=');
      
      case '!':
        if (this.peekNext() === '=') {
          this.advance();
          this.advance();
          return this.createToken(TokenType.NOT_EQUAL, '!=');
        }
        break;
        
      case '>':
        if (this.peekNext() === '=') {
          this.advance();
          this.advance();
          return this.createToken(TokenType.GREATER_EQUAL, '>=');
        }
        this.advance();
        return this.createToken(TokenType.GREATER, '>');
        
      case '<':
        if (this.peekNext() === '=') {
          this.advance();
          this.advance();
          return this.createToken(TokenType.LESS_EQUAL, '<=');
        }
        this.advance();
        return this.createToken(TokenType.LESS, '<');
      
      case '+': this.advance(); return this.createToken(TokenType.PLUS, '+');
      case '-': this.advance(); return this.createToken(TokenType.MINUS, '-');
      case '*': this.advance(); return this.createToken(TokenType.MULTIPLY, '*');
      case '/': this.advance(); return this.createToken(TokenType.DIVIDE, '/');
      case '%': this.advance(); return this.createToken(TokenType.MODULO, '%');
      case '(': this.advance(); return this.createToken(TokenType.LPAREN, '(');
      case ')': this.advance(); return this.createToken(TokenType.RPAREN, ')');
      case '{': this.advance(); return this.createToken(TokenType.LBRACE, '{');
      case '}': this.advance(); return this.createToken(TokenType.RBRACE, '}');
      case '[': this.advance(); return this.createToken(TokenType.LBRACKET, '[');
      case ']': this.advance(); return this.createToken(TokenType.RBRACKET, ']');
      case ';': this.advance(); return this.createToken(TokenType.SEMICOLON, ';');
      case ',': this.advance(); return this.createToken(TokenType.COMMA, ',');
      case '.': this.advance(); return this.createToken(TokenType.DOT, '.');
      case '\n': 
        this.advance(); 
        return this.createToken(TokenType.NEWLINE, '\n');
    }

    // Strings
    if (char === '"' || char === "'") {
      return this.string(char);
    }

    // Numbers
    if (this.isDigit(char)) {
      return this.number();
    }

    throw new Error(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
  }

  private handleIdentifierOrKeyword(): Token {
    const value = this.identifier();
    
    // Handle compound keywords
    if (value === 'chalti' && this.peek() === ' ') {
      this.skipWhitespace();
      if (this.matchWord('start')) {
        return this.createToken(TokenType.CHALTI_START, 'chalti start');
      }
    }
    
    if (value === 'bas' && this.peek() === ' ') {
      this.skipWhitespace();
      if (this.matchWord('kar')) {
        return this.createToken(TokenType.BAS_KAR, 'bas kar');
      }
    }
    
    if (value === 'nahi' && this.peek() === ' ') {
      this.skipWhitespace();
      if (this.matchWord('tar')) {
        return this.createToken(TokenType.NAHI_TAR, 'nahi tar');
      }
    }
    
    if (value === 'break' && this.peek() === ' ') {
      this.skipWhitespace();
      if (this.matchWord('kar')) {
        return this.createToken(TokenType.BREAK_KAR, 'break kar');
      }
    }
    
    if (value === 'continue' && this.peek() === ' ') {
      this.skipWhitespace();
      if (this.matchWord('kar')) {
        return this.createToken(TokenType.CONTINUE_KAR, 'continue kar');
      }
    }
    
    if (value === 'return' && this.peek() === ' ') {
      this.skipWhitespace();
      if (this.matchWord('kar')) {
        return this.createToken(TokenType.RETURN_KAR, 'return kar');
      }
    }
    
    // Single word keywords
    const tokenType = this.keywords.get(value) || TokenType.IDENTIFIER;
    return this.createToken(tokenType, value);
  }

  private matchWord(word: string): boolean {
    const savedPosition = this.position;
    const savedLine = this.line;
    const savedColumn = this.column;
    
    for (let i = 0; i < word.length; i++) {
      if (this.isAtEnd() || this.peek() !== word[i]) {
        // Restore position
        this.position = savedPosition;
        this.line = savedLine;
        this.column = savedColumn;
        return false;
      }
      this.advance();
    }
    
    // Check that next character is not alphanumeric (word boundary)
    if (!this.isAtEnd() && this.isAlphaNumeric(this.peek())) {
      // Restore position
      this.position = savedPosition;
      this.line = savedLine;
      this.column = savedColumn;
      return false;
    }
    
    return true;
  }

  private string(quote: string): Token {
    let value = '';
    this.advance(); // Skip opening quote
    
    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.advance();
        // Handle escape sequences
        switch (this.peek()) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          case 'r': value += '\r'; break;
          case '\\': value += '\\'; break;
          case '"': value += '"'; break;
          case "'": value += "'"; break;
          default: value += this.peek(); break;
        }
      } else {
        value += this.peek();
      }
      this.advance();
    }
    
    if (this.isAtEnd()) {
      throw new Error(`Unterminated string at line ${this.line}`);
    }
    
    this.advance(); // Skip closing quote
    return this.createToken(TokenType.STRING, value);
  }

  private number(): Token {
    let value = '';
    
    while (!this.isAtEnd() && this.isDigit(this.peek())) {
      value += this.advance();
    }
    
    // Handle decimal point
    if (!this.isAtEnd() && this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance(); // consume '.'
      while (!this.isAtEnd() && this.isDigit(this.peek())) {
        value += this.advance();
      }
    }
    
    return this.createToken(TokenType.NUMBER, value);
  }

  private identifier(): string {
    let value = '';
    
    while (!this.isAtEnd() && this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }
    
    return value;
  }

  private skipWhitespace(): void {
    while (!this.isAtEnd()) {
      const char = this.peek();
      if (char === ' ' || char === '\r' || char === '\t') {
        this.advance();
      } else {
        break;
      }
    }
  }

  private skipLineComment(): void {
    while (!this.isAtEnd() && this.peek() !== '\n') {
      this.advance();
    }
  }

  private skipBlockComment(): void {
    this.advance(); // skip '/'
    this.advance(); // skip '*'
    
    while (!this.isAtEnd()) {
      if (this.peek() === '*' && this.peekNext() === '/') {
        this.advance(); // skip '*'
        this.advance(); // skip '/'
        break;
      }
      this.advance();
    }
  }

  private createToken(type: TokenType, value: string): Token {
    return {
      type,
      value,
      line: this.line,
      column: this.column
    };
  }

  private isAtEnd(): boolean {
    return this.position >= this.input.length;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.input[this.position];
  }

  private peekNext(): string {
    if (this.position + 1 >= this.input.length) return '\0';
    return this.input[this.position + 1];
  }

  private advance(): string {
    if (this.isAtEnd()) return '\0';
    
    const char = this.input[this.position++];
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') ||
           (char >= 'A' && char <= 'Z') ||
           char === '_';
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}