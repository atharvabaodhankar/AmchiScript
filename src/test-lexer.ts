// src/test-lexer.ts

import { Lexer } from './lexer';

const testCode = `
chala suru karu;

// This is a comment
heAhe naam = "Rahul";
heAhe age = 25;
heAhe isStudent = khara;

dakhava "Hello, my name is ", naam;
dakhava "Age:", age;

jar (age >= 18) {
    dakhava "Adult ahe";
} nahitar {
    dakhava "Not an adult";
}

bas re ata;
`;

console.log('🚀 Testing AmchiScript Lexer...\n');

const lexer = new Lexer(testCode);
const tokens = lexer.tokenize();

console.log('📋 Tokens generated:');
console.log('='.repeat(50));

tokens.forEach((token, index) => {
  console.log(`${index.toString().padStart(2)}: ${token.type.padEnd(20)} | "${token.value.replace(/\n/g, '\\n')}" | Line ${token.line}, Col ${token.column}`);
});

console.log('\n✅ Lexer test completed!');