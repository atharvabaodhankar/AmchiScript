import { RuntimeError } from './errors';
import { Program, Statement, VarDeclaration, PrintStatement, Expression, Literal, Identifier, IfStatement, BinaryExpression, BlockStatement, Assignment, CallExpression } from './types';

import { Environment } from './environment';

class Interpreter {
    constructor() {
        this.environment = new Environment();
    }
    private environment: Environment;
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
            case 'BlockStatement':
                this.executeBlockStatement(statement as BlockStatement);
                break;
            default:
                throw new RuntimeError(`Unknown statement type: ${statement.type}`);
        }
    }

    private executePrintStatement(statement: PrintStatement): void {
        if (statement.expressions.length > 0) {
            const values = statement.expressions.map(expr => this.evaluate(expr));
            console.log(values.map(this.stringify).join(''));
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

    private evaluateCallExpression(expression: CallExpression): any {
        // Only support built-in functions for now
        if (expression.callee.type === 'Identifier') {
            const name = expression.callee.name;
            if (name === 'ghye') {
                // Node.js input sync
                const readlineSync = require('readline-sync');
                return readlineSync.question('');
            }
            if (name === 'dakhava') {
                const args = expression.arguments.map(arg => this.evaluate(arg));
                console.log(...args);
                return null;
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