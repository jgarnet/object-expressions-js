# object-expressions-js

## Overview

Evaluates expressions against objects to determine if all conditions are met.

The [evaluate](./src/evaluate.ts) function accepts an [ExpressionContext](./src/types/expression-context.ts) and returns a Promise containing `true` if all conditions are met, or `false` otherwise.

At a minimum, an `expression` and `object` are required for evaluation.

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

evaluate({
  expression: '($type = ONLINE AND $status = SHIPPED) AND $total >= 10',
  object: order
}).then(result => {
    console.log(result); // true
});
```
## Syntax and Rules

### Evaluating Fields

```javascript
import evaluate from 'object-expressions-js';

evaluate({
  expression: '$a = 1',
  object: {
    a: 1
  }
}).then(result => {
    console.log(result); // true
});
```

A field may be evaluated on an object by referencing its path in the object, preceded by the `$` symbol. The following conventions are supported:
- $rootField `{"rootField": "value"}`
- $nested.field `{"nested": {"field": "value"}}`
- $collection.0.field `{"collection": [{"field": "value"}]}`

Field paths which contain whitespace or symbols must be enclosed in brackets:
- $[field with whitespace] `{"field with whitespace": "value"}`
- $[field with /)("] `{"field with /)(\"": "value"}`

The object itself may be referenced using the `$` symbol:
- $ HAS field
- SIZE($)

### Logical Operators

```javascript
import evaluate from 'object-expressions-js';

evaluate({
  expression: '$firstName = John AND $lastName = Doe',
  object: {
    firstName: 'John',
    lastName: 'Doe'
  }
}).then(result => {
    console.log(result); // true
});
```

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

If an expression contains imbalanced logical operators, a `SyntaxError` will be thrown during evaluation.

### Groups

```javascript
import evaluate from 'object-expressions-js';

evaluate({
  expression: '($firstName = John OR $firstName = Jane) AND $lastName = Doe',
  object: {
    firstName: 'John',
    lastName: 'Doe'
  }
}).then(result => {
    console.log(result); // true
});
```

Groups are evaluated as child expressions and are represented using parentheses.

`A AND (B OR (C AND D))` `(A) AND (B)` `(A OR B)`

If an expression contains imbalanced groups, a `SyntaxError` will be thrown during evaluation.

### Conditions

```javascript
import evaluate from 'object-expressions-js';

evaluate({
  expression: '$a >= 1',
  object: {
    a: 5
  }
}).then(result => {
  console.log(result); // true
});
```

Conditions are represented via an operation containing a left-hand operand, a comparison operator, and a right-hand operand.

`$cost > 10` `$firstName LIKE ^J.+N$` `$fullName = "John Doe"`

If an expression contains imbalanced or invalid conditions (invalid number of operands, invalid comparison operators), a `SyntaxError` will be thrown during evaluation.

#### Comparison Operators

[Comparison Operators](./src/types/comparison-operator.ts) are used to evaluate conditions against an object during evaluation.

Various comparison operators are provided by default, but it is possible to overwrite or extend the provided [operators](./src/operators/_operators.ts) via the [ExpressionContext](./src/types/expression-context.ts).

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

```javascript
import evaluate from 'object-expressions-js';

evaluate({
  expression: '$field = "Hello, World"',
  object: {
    field: 'Hello, World'
  }
}).then(result => {
  console.log(result); // true
});
```

Expressions may contain string values, denoted by double quotes `"`. If a string contains child quotes, they must be escaped with a back-slash. Text that contains whitespace must be represented in a string.

`$firstName = John` `$name = "John Doe"` `$relationshipStatus = "It's \"Complicated\""`

If an expression contains unclosed strings, a `SyntaxError` will be thrown during evaluation.

### Regular Expressions

```javascript
import evaluate from 'object-expressions-js';

evaluate({
  expression: '$firstName LIKE /^[A-Z]{1}[a-z]+$/',
  object: {
    firstName: 'John'
  }
}).then(result => {
  console.log(result); // true
});
```

Regular expressions are supported &amp; must be wrapped in forward-slashes if they contain reserved symbols or keywords. If forward-slashes need to be used inside of a regular expression, they must be escaped using a back-slash.

`$url LIKE /\/products\/.*/` `$status LIKE /PROCESSED AND SHIPPED/` `$status LIKE /(SUCCESS|ERROR)/`

If an expression contains unclosed regular expressions, a `SyntaxError` will be thrown during evaluation.

### Functions

```javascript
import evaluate from 'object-expressions-js';

evaluate({
  expression: 'ADD(LEN($field), 4) = 8',
  object: {
      field: 'test'
  }
}).then(result => {
  console.log(result); // true
});
```

[Functions](./src/types/expression-function.ts) can be applied to a field's value during evaluation.

Functions can evaluate other functions as arguments.

If an expression contains an unclosed function or invalid function argument, an `ExpressionError` will be thrown during evaluation.

Various functions are provided by default, but it is possible to overwrite or extend the provided [functions](./src/functions/_functions.ts) via the [ExpressionContext](./src/types/expression-context.ts).

#### Math Functions

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
- `POW`
  - Calculates and returns the result of a base raised to the power of an exponent.
  - Requires two numeric arguments.
  - `POW($a,2)` `POW(10,2)` `POW($a,$b)`

#### String Functions

- `LEN`
  - Returns the length of a field's value.
  - `LEN($name)` `LEN($items.0.sku)`
- `LOWER`
  - Transforms a string to use all lowercase letters.
  - `LOWER($name)` `LOWER("value")`
- `UPPER`
  - Transforms a string to use all uppercase letters.
  - `UPPER($name)` `UPPER("value")`

#### Collection Functions

- `SIZE`
  - Returns the size of a collection.
  - `SIZE($)` `SIZE($items)`

### Precedence

When evaluating an expression, the following tokens are parsed:
- Groups
- Conditions
- Logical Operators

Each token is evaluated from left to right. If a token contains a group, all tokens within the group will be evaluated before moving to the next token.

## Error Handling

During evaluation, an `ExpressionError` will be thrown if errors occur. Errors will be thrown in the following situations:
- A syntax error is encountered during parsing; in this case, a `SyntaxError` will be thrown.
- A function or operator encounters invalid values; in this case, an `ExpressionError` will be thrown.
- A runtime error is encountered; in this case, an `ExpressionError` will be thrown.
  - The original error will be stored in the `cause` field on the `ExpressionError`.

## Custom Implementations

The [ExpressionContext](./src/types/expression-context.ts) can be configured to provide alternative implementations for the following classes:
- [ConditionEvaluator](./src/types/condition-evaluator.ts)
  - Evaluates a condition (containing a comparison operation) against an object.
- [ExpressionEvaluator](./src/types/expression-evaluator.ts)
  - Evaluates an expression (containing conditions, logical operators, and child groups) against an object.
- [ExpressionParser](./src/types/expression-parser.ts)
  - Parses all tokens (conditions, logical operators, child groups) from an expression, and returns an [ExpressionNode](./src/types/expression-node.ts) chain.
- [FunctionEvaluator](./src/types/function-evaluator.ts)
  - Evaluates a function within a condition.
- [PathEvaluator](./src/types/path-evaluator.ts)
  - Retrieves values from an object given a path.