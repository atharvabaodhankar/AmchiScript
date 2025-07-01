// src/test-lexer.ts

import { Lexer } from './lexer';

const testCode = `
chalti start

// This is a comment
ahe naam = "Rahul"
ahe age = 25
ahe isStudent = khara

bolta "Hello, my name is", naam
bolta "Age:", age

jar age >= 18 {
    bolta "Adult ahe"
} nahi tar age < 13 {
    bolta "Child ahe"  
} otherwise {
    bolta "Teen ahe"
}

bas kar
`;

console.log('🚀 Testing AmchiScript Lexer...\n');

const lexer = new Lexer(testCode);
const tokens = lexer.tokenize();

console.log('📋 Tokens generated:');
console.log('='.repeat(50));

tokens.forEach((token, index) => {
  console.log(`${index.toString().padStart(2)}: ${token.type.padEnd(20)} | "${token.value.replace(/\n/g, '\\n')}" | Line ${token.line}, Col ${token.column});
});

console.log('\n✅ Lexer test completed!');