import { RuntimeError } from './errors';
import { Program, Statement, VarDeclaration, PrintStatement, Expression, Literal, Identifier, IfStatement, BinaryExpression, BlockStatement, Assignment, CallExpression } from './types';

import { Environment } from './environment';

class BreakException {}
class ContinueException {}
class ReturnException {
    value: any;
    constructor(value: any) { this.value = value; }
}

class Interpreter {
    constructor(options?: { input?: () => Promise<string> | string, output?: (msg: string) => void }) {
        this.environment = new Environment();
        this.inputHandler = options?.input;
        this.outputHandler = options?.output;
    }
    private environment: Environment;
    private inputHandler?: () => Promise<string> | string;
    private outputHandler?: (msg: string) => void;
    interpret(program: Program): void {
        try {
            for (const statement of program.body) {
                this.execute(statement);
            }
        } catch (error: unknown) {
            if (error instanceof RuntimeError) {
                console.error(error.message);
            } else if (error instanceof Error) {
                console.error(`Runtime Error: ${error.message}`);
            } else {
                console.error('An unknown error occurred.');
                throw error;
            }
        }
    }

    private execute(statement: Statement): void {
        switch (statement.type) {
            case 'VarDeclaration':
                this.executeVarDeclaration(statement as VarDeclaration);
                break;
            case 'Assignment':
                this.executeAssignment(statement as Assignment);
                break;
            case 'PrintStatement':
                this.executePrintStatement(statement as PrintStatement);
                break;
            case 'IfStatement':
                this.executeIfStatement(statement as IfStatement);
                break;
            case 'WhileStatement':
                this.executeWhileStatement(statement as any);
                break;
            case 'BlockStatement':
                this.executeBlockStatement(statement as BlockStatement);
                break;
            case 'BreakStatement':
                throw new BreakException();
            case 'ContinueStatement':
                throw new ContinueException();
            case 'FunctionDeclaration':
                this.environment.define(statement.name, statement);
                break;
            case 'ReturnStatement':
                throw new ReturnException(statement.value ? this.evaluate(statement.value) : undefined);
            default:
                throw new RuntimeError(`Unknown statement type: ${statement.type}`);
        }
    }

    private executePrintStatement(statement: PrintStatement): void {
        if (statement.expressions.length > 0) {
            const values = statement.expressions.map(expr => this.evaluate(expr));
            const output = values.map(this.stringify).join('');
            if (this.outputHandler) {
                this.outputHandler(output);
            } else {
                console.log(output);
            }
        } else {
            throw new RuntimeError('PrintStatement expects at least one expression.');
        }
    }

    private executeVarDeclaration(statement: VarDeclaration): void {
        let value = null;
        if (statement.initializer) {
            value = this.evaluate(statement.initializer);
        }
        this.environment.define(statement.name, value);
    }

    private executeIfStatement(statement: IfStatement): void {
        if (this.evaluate(statement.condition)) {
            this.execute(statement.consequent);
        } else if (statement.alternate) {
            this.execute(statement.alternate);
        }
    }

    private executeBlockStatement(statement: BlockStatement): void {
        for (const stmt of statement.body) {
            this.execute(stmt);
        }
    }

    private executeAssignment(statement: Assignment): void {
        const value = this.evaluate(statement.value);
        this.environment.set(statement.identifier, value);
    }

    private executeWhileStatement(statement: any): void {
        while (this.evaluate(statement.condition)) {
            try {
                this.execute(statement.body);
            } catch (e) {
                if (e instanceof BreakException) {
                    break;
                } else if (e instanceof ContinueException) {
                    continue;
                } else {
                    throw e;
                }
            }
        }
    }

    private evaluate(expression: Expression): any {
        switch (expression.type) {
            case 'Literal':
                const literal = expression as Literal;
                if (typeof literal.value === 'string' && !isNaN(Number(literal.value))) {
                    return Number(literal.value);
                }
                return literal.value;
            case 'Identifier':
                return this.environment.get((expression as Identifier).name);
            case 'BinaryExpression':
                return this.evaluateBinaryExpression(expression as BinaryExpression);
            case 'UnaryExpression':
                return this.evaluateUnaryExpression(expression as any);
            case 'CallExpression':
                return this.evaluateCallExpression(expression as CallExpression);
            default:
                throw new RuntimeError(`Unknown expression type: ${expression.type}`);
        }
    }

    private evaluateBinaryExpression(expression: BinaryExpression): any {
        const left = this.evaluate(expression.left);
        const right = this.evaluate(expression.right);

        switch (expression.operator) {
            case 'ani': return left && right;
            case 'kimva': return left || right;
            case '>': return left > right;
            case '>=': return left >= right;
            case '<': return left < right;
            case '<=': return left <= right;
            case '==': return left == right;
            case '!=': return left != right;
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '%': return left % right;
            default:
                throw new RuntimeError(`Unknown binary operator: ${expression.operator}`);
        }
    }

    private evaluateUnaryExpression(expression: any): any {
        const arg = this.evaluate(expression.argument);
        switch (expression.operator) {
            case '-': return -arg;
            case 'nahi': return !arg;
            case '!=': return !arg;
            default:
                throw new RuntimeError(`Unknown unary operator: ${expression.operator}`);
        }
    }

    private async evaluateCallExpression(expression: CallExpression): Promise<any> {
        // Only support built-in functions for now
        if (expression.callee.type === 'Identifier') {
            const name = expression.callee.name;
            if (name === 'ghye') {
                if (this.inputHandler) {
                    if (typeof this.inputHandler === 'function') {
                        const result = this.inputHandler();
                        if (result instanceof Promise) {
                            return await result;
                        }
                        return result;
                    }
                    return this.inputHandler;
                } else if (typeof window !== 'undefined' && window.prompt) {
                    return window.prompt('');
                } else {
                    throw new RuntimeError('Input handler not provided and prompt is not available.');
                }
            }
            if (name === 'dakhava') {
                const args = await Promise.all(expression.arguments.map(arg => this.evaluate(arg)));
                const output = args.join(' ');
                if (this.outputHandler) {
                    this.outputHandler(output);
                } else {
                    console.log(...args);
                }
                return null;
            }
            // User-defined function
            const func = this.environment.get(name);
            if (func && func.type === 'FunctionDeclaration') {
                if (expression.arguments.length !== func.parameters.length) {
                    throw new RuntimeError(`Function '${name}' expects ${func.parameters.length} arguments, got ${expression.arguments.length}.`);
                }
                // Create new environment for function call
                const previousEnv = this.environment;
                const localEnv = new Environment();
                this.environment = localEnv;
                // Bind parameters
                for (let i = 0; i < func.parameters.length; i++) {
                    localEnv.define(func.parameters[i], await this.evaluate(expression.arguments[i]));
                }
                let result = undefined;
                try {
                    this.execute(func.body);
                } catch (e) {
                    if (e instanceof ReturnException) {
                        result = e.value;
                    } else {
                        throw e;
                    }
                }
                this.environment = previousEnv;
                return result;
            }
        }
        throw new RuntimeError(`Unknown function: ${expression.callee.type === 'Identifier' ? expression.callee.name : 'non-identifier'}`);
    }

    private stringify(value: any): string {
        if (value === null) return 'nil';
        return String(value);
    }
}

export { Interpreter }; 