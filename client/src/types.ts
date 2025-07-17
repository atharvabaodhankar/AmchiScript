// src/types.ts

export enum TokenType {
  // Program Structure
  CHALA_SURU_KARU = 'CHALA_SURU_KARU',
  BAS_RE_ATA = 'BAS_RE_ATA',

  // IO
  DAKHAVA = 'DAKHAVA', // print
  GHYE = 'GHYE', // input

  // Variables
  HE_AHE = 'HE_AHE', // var/let

  // Functions
  KAAM_KAR = 'KAAM_KAR', // function
  PARAT_DE = 'PARAT_DE', // return

  // Control Flow
  JAR = 'JAR', // if
  NAHITAR = 'NAHITAR', // else
  NAHITAR_JAR = 'NAHITAR_JAR', // else if
  PUNHA_KAR = 'PUNHA_KAR', // loop/while
  PRATYEK_SATHI = 'PRATYEK_SATHI', // for each
  THAMB = 'THAMB', // break
  PUDHE_JA = 'PUDHE_JA', // continue

  // Data Structures
  YADI = 'YADI', // list/array

  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  IDENTIFIER = 'IDENTIFIER',

  // Boolean & Null
  KHARA = 'KHARA', // true
  KHOTA = 'KHOTA', // false
  RIKAM = 'RIKAM', // null

  // Keywords for Operations
  JOD = 'JOD', // add/append
  MOJ = 'MOJ', // count/length
  MOTHA_AHE_KA = 'MOTHA_AHE_KA', // is_greater
  LAHAN_AHE_KA = 'LAHAN_AHE_KA', // is_less
  SARKHA_AHE_KA = 'SARKHA_AHE_KA', // is_equal

  // Logical
  ANI = 'ANI', // and
  KIMVA = 'KIMVA', // or
  NAHI = 'NAHI', // not

  // Operators
  ASSIGN = 'ASSIGN', // =
  PLUS = 'PLUS', // +
  MINUS = 'MINUS', // -
  MULTIPLY = 'MULTIPLY', // *
  DIVIDE = 'DIVIDE', // /
  MODULO = 'MODULO', // %

  // Comparison
  EQUAL = 'EQUAL', // ==
  NOT_EQUAL = 'NOT_EQUAL', // !=
  GREATER = 'GREATER', // >
  LESS = 'LESS', // <
  GREATER_EQUAL = 'GREATER_EQUAL', // >=
  LESS_EQUAL = 'LESS_EQUAL', // <=

  // Punctuation
  SEMICOLON = 'SEMICOLON', // ;
  COMMA = 'COMMA', // ,
  LPAREN = 'LPAREN', // (
  RPAREN = 'RPAREN', // )
  LBRACE = 'LBRACE', // {
  RBRACE = 'RBRACE', // }
  LBRACKET = 'LBRACKET', // [
  RBRACKET = 'RBRACKET', // ]
  DOT = 'DOT', // .

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



export interface PlaceholderStatement {
  type: 'PlaceholderStatement';
}

export type Statement = 
  | Program
  | VarDeclaration
  | Assignment
  | PrintStatement
  | BlockStatement
  | IfStatement
  | WhileStatement
  | FunctionDeclaration
  | ReturnStatement
  | BreakStatement
  | ContinueStatement
  | PlaceholderStatement;

export type Expression =
  | Literal
  | Identifier
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | MemberExpression;

export interface BinaryExpression {
  type: 'BinaryExpression';
  left: Expression;
  operator: string;
  right: Expression;
}

// Statements
export interface VarDeclaration {
  type: 'VarDeclaration';
  name: string;
  initializer: Expression | null;
}

export interface Assignment {
  type: 'Assignment';
  identifier: string;
  value: Expression;
}

export interface PrintStatement {
  type: 'PrintStatement';
  expressions: Expression[];
}

export interface BlockStatement {
  type: 'BlockStatement';
  body: Statement[];
}

export interface IfStatement {
  type: 'IfStatement';
  condition: Expression;
  consequent: Statement;
  alternate?: Statement;
}

export interface WhileStatement {
  type: 'WhileStatement';
  condition: Expression;
  body: Statement;
}

export interface FunctionDeclaration {
  type: 'FunctionDeclaration';
  name: string;
  parameters: string[];
  body: BlockStatement;
}

export interface ReturnStatement {
  type: 'ReturnStatement';
  value?: Expression;
}

export interface BreakStatement {
  type: 'BreakStatement';
}

export interface ContinueStatement {
  type: 'ContinueStatement';
}

// Expressions
export interface Literal {
  type: 'Literal';
  value: any;
  raw: string;
}

export interface Identifier {
  type: 'Identifier';
  name: string;
}

export interface BinaryExpression {
  type: 'BinaryExpression';
  left: Expression;
  operator: string;
  right: Expression;
}

export interface UnaryExpression {
  type: 'UnaryExpression';
  operator: string;
  argument: Expression;
}

export interface CallExpression {
  type: 'CallExpression';
  callee: Expression;
  arguments: Expression[];
}

export interface MemberExpression {
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