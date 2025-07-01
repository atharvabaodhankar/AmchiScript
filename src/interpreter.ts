import { RuntimeError } from './errors';
import { Program, Statement, VarDeclaration, PrintStatement, Expression, Literal, Identifier, IfStatement, BinaryExpression, BlockStatement } from './types';

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
        // This will be implemented in subsequent steps
        switch (statement.type) {
            case 'VarDeclaration':
                this.executeVarDeclaration(statement as VarDeclaration);
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
        // Assuming bolta only takes one expression for now
        if (statement.expressions.length > 0) {
            const value = this.evaluate(statement.expressions[0]);
            console.log(this.stringify(value));
        } else {
            throw new RuntimeError('PrintStatement expects at least one expression.');
        }
    }

    private evaluate(expression: Expression): any {
        // This will be implemented in subsequent steps
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
            default:
                throw new RuntimeError(`Unknown expression type: ${expression.type}`);
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

    private stringify(value: any): string {
        if (value === null) return 'nil';
        return String(value);
    }
}

export { Interpreter };