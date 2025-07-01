# AmchiScript

AmchiScript is a simple, interpreted scripting language designed for educational purposes. It uses a mix of English and Marathi/Hindi (Minglish) keywords, making it a unique and fun way to learn the fundamentals of programming.

## Getting Started

### Prerequisites

*   Node.js (v14 or higher)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/AmchiScript.git
    cd AmchiScript
    ```

2.  Install the dependencies:
    ```bash
    npm install
    ```

### Running a Script

To run an AmchiScript file, use the `npm run start` command, followed by the path to your script:

```bash
npm run start examples/hello.amchi
```

## Language Reference

### Program Structure

Every AmchiScript program must start with `chala suru karu;` and end with `bas re ata;`.

```amchi
chala suru karu;

// Your code goes here

dakhava "Program finished!";

bas re ata;
```

### Keywords

| Minglish Keyword | Programming Meaning        | Description                                                  |
| ---------------- | -------------------------- | ------------------------------------------------------------ |
| `dakhava`        | `print`                    | Displays output to the console.                              |
| `ghye`           | `input`                    | Gets user input from the console.                            |
| `heAhe`          | `var` / `let`              | Declares and assigns a variable.                             |
| `kaamKar`        | `function`                 | Defines a function.                                          |
| `paratDe`        | `return`                   | Returns a value from a function.                             |
| `jar`            | `if`                       | A conditional statement.                                     |
| `nahitar`        | `else`                     | The `else` part of a conditional statement.                  |
| `punhaKar`       | `loop` / `while`           | A general-purpose loop for repetition.                       |
| `pratyekSathi`   | `for_each`                 | Iterates over items in a collection.                         |
| `thamb`          | `break`                    | Exits a loop prematurely.                                    |
| `pudheJa`        | `continue`                 | Skips to the next iteration of a loop.                       |
| `yadi`           | `list` / `array`           | An ordered collection of items.                              |
| `khara`          | `true`                     | The boolean value for true.                                  |
| `khota`          | `false`                    | The boolean value for false.                                 |
| `rikam`          | `null` / `none`            | Represents the absence of a value.                           |
| `jod`            | `add` / `append`           | Combines or adds items to a list.                            |
| `moj`            | `count` / `length`         | Gets the count of items in a collection or characters in a string. |
| `mothaAheKa`     | `is_greater` ( `>` )       | Compares if one value is greater than another.               |
| `lahanAheKa`     | `is_less` ( `<` )          | Compares if one value is less than another.                  |
| `sarkhaAheKa`    | `is_equal` ( `==` )        | Compares if two values are equal.                            |
| `ani`            | `and`                      | The logical AND operator.                                    |
| `kimva`          | `or`                       | The logical OR operator.                                     |
| `nahi`           | `not`                      | The logical NOT operator.                                    |

### Sample Programs

#### 1. Hello, World!

This program demonstrates the basic structure of an AmchiScript file and how to print a message to the console.

```amchi
// examples/hello.amchi

chala suru karu;

dakhava "Hello, World!";

bas re ata;
```

#### 2. Variables and Basic I/O

This example shows how to declare variables, take user input, and display a personalized message.

```amchi
// examples/variables.amchi

chala suru karu;

heAhe name = "";
dakhava "What is your name?";
name = ghye();

dakhava "Hello, " + name + "! Welcome to AmchiScript.";

bas re ata;
```

#### 3. Conditional Logic

This program demonstrates how to use `if` and `else` statements to make decisions.

```amchi
// examples/conditionals.amchi

chala suru karu;

heAhe age = 25;

jar (age > 18) {
  dakhava "You are an adult.";
} nahitar {
  dakhava "You are a minor.";
}

bas re ata;
```

#### 4. Loops

This example shows how to use a `while` loop to repeat a block of code.

```amchi
// examples/loop.amchi

chala suru karu;

heAhe count = 1;

punhaKar (count <= 5) {
  dakhava "Iteration: " + count;
  count = count + 1;
}

bas re ata;
```

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.
