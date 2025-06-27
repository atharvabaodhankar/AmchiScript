// src/types.ts

export enum TokenType {
  // Program Structure
  CHALTI_START = 'CHALTI_START',     // chalti start
  BAS_KAR = 'BAS_KAR',               // bas kar
  
  // Variables
  AHE = 'AHE',                       // ahe
  SET = 'SET',                       // set
  
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  IDENTIFIER = 'IDENTIFIER',
  
  // Boolean & Null
  KHARA = 'KHARA',                   // khara (true)
  KHOTA = 'KHOTA',                   // khota (false)
  NAHI = 'NAHI',                     // nahi (null)
  
  // Output
  BOLTA = 'BOLTA',                   // bolta (print)
  
  // Control Flow
  JAR = 'JAR',                       // jar (if)
  NAHI_TAR = 'NAHI_TAR',            // nahi tar (else if)
  OTHERWISE = 'OTHERWISE',           // otherwise (else)
  JOPARYANT = 'JOPARYANT',          // joparyant (while)
  PRATYEK = 'PRATYEK',              // pratyek (for each)
  BREAK_KAR = 'BREAK_KAR',          // break kar
  CONTINUE_KAR = 'CONTINUE_KAR',    // continue kar
  
  // Functions
  FUNCTION = 'FUNCTION',             // function
  RETURN_KAR = 'RETURN_KAR',        // return kar
  
  // Operators
  ASSIGN = 'ASSIGN',                 // =
  PLUS = 'PLUS',                     // +
  MINUS = 'MINUS',                   // -
  MULTIPLY = 'MULTIPLY',             // *
  DIVIDE = 'DIVIDE',                 // /
  MODULO = 'MODULO',                 // %
  
  // Comparison
  EQUAL = 'EQUAL',                   // ==
  NOT_EQUAL = 'NOT_EQUAL',           // !=
  GREATER = 'GREATER',               // >
  LESS = 'LESS',                     // <
  GREATER_EQUAL = 'GREATER_EQUAL',   // >=
  LESS_EQUAL = 'LESS_EQUAL',         // <=
  
  // Logical
  ANI = 'ANI',                       // ani (and)
  KIVA = 'KIVA',                     // kiva (or)
  NAKO = 'NAKO',                     // nako (not)
  
  // Punctuation
  SEMICOLON = 'SEMICOLON',           // ;
  COMMA = 'COMMA',                   // ,
  LPAREN = 'LPAREN',                // (
  RPAREN = 'RPAREN',                // )
  LBRACE = 'LBRACE',                // {
  RBRACE = 'RBRACE',                // }
  LBRACKET = 'LBRACKET',            // [
  RBRACKET = 'RBRACKET',            // ]
  DOT = 'DOT',                      // .
  
  // Special
  EOF = 'EOF',
  NEWLINE = 'NEWLINE',
  COMMENT = 'COMMENT'
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export interface Position {
  line: number;
  column: number;
}

// AST Node Types
export interface ASTNode {
  type: string;
  position?: Position;
}

export interface Program extends ASTNode {
  type: 'Program';
  body: Statement[];
}

export interface Statement extends ASTNode {}
export interface Expression extends ASTNode {}

// Statements
export interface VariableDeclaration extends Statement {
  type: 'VariableDeclaration';
  identifier: string;
  value: Expression;
}

export interface Assignment extends Statement {
  type: 'Assignment';
  identifier: string;
  value: Expression;
}

export interface PrintStatement extends Statement {
  type: 'PrintStatement';
  expressions: Expression[];
}

export interface BlockStatement extends Statement {
  type: 'BlockStatement';
  body: Statement[];
}

export interface IfStatement extends Statement {
  type: 'IfStatement';
  condition: Expression;
  consequent: Statement;
  alternate?: Statement;
}

export interface WhileStatement extends Statement {
  type: 'WhileStatement';
  condition: Expression;
  body: Statement;
}

export interface FunctionDeclaration extends Statement {
  type: 'FunctionDeclaration';
  name: string;
  parameters: string[];
  body: BlockStatement;
}

export interface ReturnStatement extends Statement {
  type: 'ReturnStatement';
  value?: Expression;
}

export interface BreakStatement extends Statement {
  type: 'BreakStatement';
}

export interface ContinueStatement extends Statement {
  type: 'ContinueStatement';
}

// Expressions
export interface Literal extends Expression {
  type: 'Literal';
  value: any;
  raw: string;
}

export interface Identifier extends Expression {
  type: 'Identifier';
  name: string;
}

export interface BinaryExpression extends Expression {
  type: 'BinaryExpression';
  left: Expression;
  operator: string;
  right: Expression;
}

export interface UnaryExpression extends Expression {
  type: 'UnaryExpression';
  operator: string;
  argument: Expression;
}

export interface CallExpression extends Expression {
  type: 'CallExpression';
  callee: Expression;
  arguments: Expression[];
}

export interface MemberExpression extends Expression {
  type: 'MemberExpression';
  object: Expression;
  property: Expression;
  computed: boolean;
}

// Runtime Values
export type RuntimeValue = 
  | NumberValue 
  | StringValue 
  | BooleanValue 
  | NullValue 
  | FunctionValue
  | ObjectValue;

export interface NumberValue {
  type: 'number';
  value: number;
}

export interface StringValue {
  type: 'string';
  value: string;
}

export interface BooleanValue {
  type: 'boolean';
  value: boolean;
}

export interface NullValue {
  type: 'null';
  value: null;
}

export interface FunctionValue {
  type: 'function';
  name: string;
  parameters: string[];
  body: BlockStatement;
  closure: Environment;
}

export interface ObjectValue {
  type: 'object';
  properties: Map<string, RuntimeValue>;
}

// Environment for variable scope
export class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeValue>;

  constructor(parent?: Environment) {
    this.parent = parent;
    this.variables = new Map();
  }

  define(name: string, value: RuntimeValue): void {
    this.variables.set(name, value);
  }

  get(name: string): RuntimeValue {
    if (this.variables.has(name)) {
      return this.variables.get(name)!;
    }

    if (this.parent) {
      return this.parent.get(name);
    }

    throw new Error(`Undefined variable '${name}'`);
  }

  set(name: string, value: RuntimeValue): void {
    if (this.variables.has(name)) {
      this.variables.set(name, value);
      return;
    }

    if (this.parent) {
      this.parent.set(name, value);
      return;
    }

    throw new Error(`Undefined variable '${name}'`);
  }

  has(name: string): boolean {
    return this.variables.has(name) || (this.parent?.has(name) ?? false);
  }
}