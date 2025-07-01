import { RuntimeError } from './errors';
import { Program, Statement, VarDeclaration, PrintStatement, Expression, Literal, Identifier } from './types';

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
                return (expression as Literal).value;
            case 'Identifier':
                return this.environment.get((expression as Identifier).name);
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

    private stringify(value: any): string {
        if (value === null) return 'nil';
        return String(value);
    }
}

export { Interpreter };