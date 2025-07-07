// src/lexer.ts

import { Token, TokenType } from './types';

export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  
  private keywords: Map<string, TokenType> = new Map([
    // Program Structure
    ['chala', TokenType.CHALA_SURU_KARU],
    ['suru', TokenType.CHALA_SURU_KARU],
    ['karu', TokenType.CHALA_SURU_KARU],
    ['bas', TokenType.BAS_RE_ATA],
    ['re', TokenType.BAS_RE_ATA],
    ['ata', TokenType.BAS_RE_ATA],

    // IO
    ['dakhava', TokenType.DAKHAVA],
    ['ghye', TokenType.GHYE],

    // Variables
    ['heahe', TokenType.HE_AHE],

    // Functions
    ['kaamkar', TokenType.KAAM_KAR],
    ['paratde', TokenType.PARAT_DE],

    // Control Flow
    ['jar', TokenType.JAR],
    ['nahitar', TokenType.NAHITAR],
    ['punhakar', TokenType.PUNHA_KAR],
    ['javastor', TokenType.PUNHA_KAR],
    ['pratyeksathi', TokenType.PRATYEK_SATHI],
    ['thamb', TokenType.THAMB],
    ['pudheja', TokenType.PUDHE_JA],

    // Data Structures
    ['yadi', TokenType.YADI],

    // Literals
    ['khara', TokenType.KHARA],
    ['khota', TokenType.KHOTA],
    ['rikam', TokenType.RIKAM],

    // Keywords for Operations
    ['jod', TokenType.JOD],
    ['moj', TokenType.MOJ],
    ['mothaaheka', TokenType.MOTHA_AHE_KA],
    ['lahanaheka', TokenType.LAHAN_AHE_KA],
    ['sarkhaaheka', TokenType.SARKHA_AHE_KA],

    // Logical
    ['ani', TokenType.ANI],
    ['kimva', TokenType.KIMVA],
    ['nahi', TokenType.NAHI],
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

    // Handle compound keywords first, as they are more specific
    if (value.toLowerCase() === 'chala' && this.peek() === ' ') {
      this.skipWhitespace();
      if (this.matchWord('suru')) {
        this.skipWhitespace();
        if (this.matchWord('karu')) {
          return this.createToken(TokenType.CHALA_SURU_KARU, 'chala suru karu');
        }
      }
    }

    if (value.toLowerCase() === 'bas' && this.peek() === ' ') {
      this.skipWhitespace();
      if (this.matchWord('re')) {
        this.skipWhitespace();
        if (this.matchWord('ata')) {
          return this.createToken(TokenType.BAS_RE_ATA, 'bas re ata');
        }
      }
    }

    // Single word keywords
    const lowerCaseValue = value.toLowerCase();
    const tokenType = this.keywords.get(lowerCaseValue) || TokenType.IDENTIFIER;
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
    while (!this.isAtEnd()) {
      const char = this.peek();
      if (char === quote) {
        this.advance(); // Skip closing quote
        return this.createToken(TokenType.STRING, value);
      }
      if (char === '\n' || char === '\r') {
        throw new Error(`Unterminated string at line ${this.line}`);
      }
      if (char === '\\') {
        this.advance();
        const nextChar = this.peek();
        switch (nextChar) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          case 'r': value += '\r'; break;
          case '\\': value += '\\'; break;
          case '"': value += '"'; break;
          case "'": value += "'"; break;
          default: value += nextChar; break;
        }
        this.advance();
      } else {
        value += char;
        this.advance();
      }
    }
    throw new Error(`Unterminated string at line ${this.line}`);
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
      if (char === ' ' || char === '\n' || char === '\t' || char === '\r') {
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