import { Program, Statement, Expression, Literal, PrintStatement } from './types';
import { RuntimeError } from './errors';

class Interpreter {
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
        if (statement.type === 'PrintStatement') {
            this.executePrintStatement(statement as PrintStatement);
        } else {
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
        if (expression.type === 'Literal') {
            return (expression as Literal).value;
        } else {
            throw new RuntimeError(`Unknown expression type: ${expression.type}`);
        }
    }

    private stringify(value: any): string {
        if (value === null) return 'nil';
        return String(value);
    }
}

export { Interpreter };