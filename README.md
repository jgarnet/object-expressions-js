# object-expressions-js

## Overview

Evaluates expressions against objects to determine if all conditions are met.

```javascript
import evaluate from 'object-expressions-js';

const order = {
    type: 'ONLINE',
    status: 'SHIPPED',
    items: [
        {
            sku: 'A1234',
            name: 'Some Item',
            price: 10
        }
    ],
    tax: 0.07,
    total: 10.70
};

const result = evaluate({
  expression: '($type = ONLINE AND $status = SHIPPED) AND $total >= 10',
  object: order
}); // result = true
```

## Syntax and Rules

### Evaluating Fields

A field may be evaluated on an object by referencing its path in the object, preceded by the `$` symbol. The following conventions are supported:
- $rootField `{"rootField": "value"}`
- $nested.field `{"nested": {"field": "value"}}`
- $collection.0.field `{"collection": [{"field": "value"}]}`

### Logical Operators

The allowed logical operators include:
- `AND`
  - Represents a logical AND.
- `OR`
  - Represents a logical OR.
- `NOT`
  - Represents a negation.

Logical operators can be applied to root-level conditions and groups:

`A AND B`
`A AND (B OR C)`
`NOT A`
`A AND NOT B`

If an expression contains imbalanced logical operators, a SyntaxError will be thrown during evaluation.

### Groups

Groups are evaluated as child expressions and are represented using parentheses.

`A AND (B OR (C AND D))` `(A) AND (B)` `(A OR B)`

If an expression contains imbalanced groups, a SyntaxError will be thrown during evaluation.

### Conditions

Conditions are represented via an operation containing a left-hand operand, a comparison operator, and a right-hand operand.

`$cost > 10` `$firstName LIKE ^J.+N$` `$fullName = "John Doe"`

If an expression contains imbalanced or invalid conditions (invalid number of operands, invalid comparison operators), a SyntaxError will be thrown during evaluation.

#### Comparison Operators

The following comparison operators are provided:
- `=`
  - Determines if a field's value is equal to a primitive value.
  - Equality of boolean values should be done using `IS`.
- `>`
- `<`
- `>=`
- `<=`
- `HAS`
  - Determines if the object or one of the object's fields contains a target field.
  - The `$` symbol can be used to represent the root object.
  - `$ HAS items` `$items.0 HAS sku`
- `IN`
  - Determines if a field's value exists within a collection.
  - `$items.0.sku IN A1234,B5678`
- `IS`
  - Determines if a field matches one of the following:
    - `EMPTY`
      - `$name IS EMPTY`
    - `NULL`
      - `$items.0.price IS NULL`
    - `TRUE`
      - `$isComplete IS TRUE`
    - `FALSE`
      - `$isComplete IS FALSE`
- `LIKE`
  - Determines if a field's value matches a regular expression.
  - `$name LIKE ^J.+n$` `$items.0.sku LIKE A*`

### Strings

Expressions may contain string values, denoted by double quotes `"`. If a string contains child quotes, they must be escaped with a back-slash. Text that contains whitespace must be represented in a string.

`$firstName = John` `$name = "John Doe"` `$relationshipStatus = "It's \"Complicated\""`

If an expression contains unclosed strings, a SyntaxError will be thrown during evaluation.

### Regular Expressions

Regular expressions are supported &amp; must be wrapped in forward-slashes if they contain reserved symbols or keywords. If forward-slashes need to be used inside of a regular expression, they must be escaped using a back-slash.

`$url LIKE /\/products\/.*/` `$status LIKE /PROCESSED AND SHIPPED/` `$status LIKE /(SUCCESS|ERROR)/`

If an expression contains unclosed regular expressions, a SyntaxError will be thrown during evaluation.

### Functions

```javascript
const evaluator = new BaseExpressionEvaluator();
const result = evaluator.evaluate({
  expression: 'ADD(LEN($field), 4) = 8',
  object: {
      field: 'test'
  }
}); // result = true
```

Functions can be applied to a field's value during evaluation. The following functions are provided:
- `LEN`
  - Returns the length of a field's value.
  - `LEN($name)` `LEN($items.0.sku)`
- `ADD`
  - Calculates the sum of all arguments and returns the result.
  - Requires at least two arguments.
  - String arguments represent field paths which will be retrieved from the object being evaluated.
  - `ADD($fieldA,$fieldB.0.value)` `ADD($fieldA,2)` `ADD(2,2)`
- `SUBTRACT`
  - Calculates the difference of all arguments and returns the result.
  - Requires at least two arguments.
  - String arguments represent field paths which will be retrieved from the object being evaluated.
  - `SUBTRACT($fieldA,$fieldB.0.value)` `SUBTRACT($fieldA,2)` `SUBTRACT(2,2)`
- `MULTIPLY`
  - Calculates the product of all arguments and returns the result.
  - Requires at least two arguments.
  - String arguments represent field paths which will be retrieved from the object being evaluated.
  - `MULTIPLY($fieldA,$fieldB.0.value)` `MULTIPLY($fieldA,2)` `MULTIPLY(2,2)`
- `DIVIDE`
  - Calculates the quotient of all arguments and returns the result.
  - Requires at least two arguments.
  - String arguments represent field paths which will be retrieved from the object being evaluated.
  - `DIVIDE($fieldA,$fieldB.0.value)` `DIVIDE($fieldA,2)` `DIVIDE(2,2)`

Functions can evaluate other functions as arguments.

If an expression contains an unclosed function or invalid function argument, a SyntaxError will be thrown during evaluation.

### Precedence

When evaluating an expression, the following tokens are parsed:
- Groups
- Conditions
- Logical Operators

Each token is evaluated from left to right. If a token contains a group, all tokens within the group will be evaluated before moving to the next token.