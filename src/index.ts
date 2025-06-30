import * as fs from 'fs';
import { run } from './cli';

function main() {
    const args = process.argv.slice(2);

    if (args.length !== 1) {
        console.log('Usage: npm run start <file_path>');
        process.exit(1);
    }

    const filePath = args[0];

    try {
        const source = fs.readFileSync(filePath, 'utf-8');
        run(source);
    } catch (error) {
        console.error(`Error reading file: ${filePath}`);
        if (error instanceof Error) {
            console.error(error.message);
        }
        process.exit(1);
    }
}

main();