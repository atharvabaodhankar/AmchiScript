import { RuntimeError } from './errors';

export class Environment {
    private values: Map<string, any> = new Map();

    define(name: string, value: any): void {
        this.values.set(name, value);
    }

    get(name: string): any {
        if (this.values.has(name)) {
            return this.values.get(name);
        }
        throw new RuntimeError(`Undefined variable '${name}'.`);
    }

    set(name: string, value: any): void {
        if (!this.values.has(name)) {
            throw new RuntimeError(`Cannot assign to undefined variable '${name}'.`);
        }
        this.values.set(name, value);
    }
} 