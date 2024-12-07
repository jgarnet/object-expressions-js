# object-expressions-js

## Overview

Evaluates if each condition (in relation to an object) contained in an expression is true, allowing business rules to be defined using expressions.

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
- `$rootField` (root field access) `{"rootField": "value"}`
- `$nested.field` (nested field access) `{"nested": {"field": "value"}}`
- `$0` (collection access) `[{ "name": "John Doe" }]`
- `$collection.0.field` (nested collection access) `{"collection": [{"field": "value"}]}`

Field paths which contain whitespace or symbols must be enclosed in brackets:
- `$[field with whitespace]` (fields with whitespace) `{"field with whitespace": "value"}`
- `$[field with /)("]` (fields with special characters) `{"field with /)(\"": "value"}`

The object itself may be referenced using the `$` symbol:
- `$ HAS field`
- `SIZE($)`

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

A condition may contain a single function call if the function returns a boolean value:

- `EXISTS($items, ($ HAS $sku))`
- If a non-boolean result is returned, an `ExpressionError` will be thrown during evaluation.

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

Expressions may contain string values, denoted by single quotes `'` or double quotes `"`. If a string contains child quotes of the same symbol (i.e. nested double quotes or nested single quotes), they must be escaped with a back-slash. Text that contains whitespace must be represented in a string.

`$firstName = John` `$name = "John Doe"` `$relationshipStatus = "It's \"Complicated\""` `$name = 'John Doe'` `$relationshipStatus = 'It\'s "complicated"'`

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
- `DIVIDE`
  - Calculates the quotient of all arguments and returns the result.
  - Requires at least two arguments.
  - String arguments represent field paths which will be retrieved from the object being evaluated.
  - `DIVIDE($fieldA,$fieldB.0.value)` `DIVIDE($fieldA,2)` `DIVIDE(2,2)`
- `MOD`
  - Returns the remainder between two numbers.
  - Requires two numeric arguments.
  - `MOD($a, $b)` `MOD(4, 2)` `MOD($a, 2)`
- `MULTIPLY`
  - Calculates the product of all arguments and returns the result.
  - Requires at least two arguments.
  - String arguments represent field paths which will be retrieved from the object being evaluated.
  - `MULTIPLY($fieldA,$fieldB.0.value)` `MULTIPLY($fieldA,2)` `MULTIPLY(2,2)`
- `POW`
  - Calculates and returns the result of a base raised to the power of an exponent.
  - Requires two numeric arguments.
  - `POW($a,2)` `POW(10,2)` `POW($a,$b)`
- `SUBTRACT`
  - Calculates the difference of all arguments and returns the result.
  - Requires at least two arguments.
  - String arguments represent field paths which will be retrieved from the object being evaluated.
  - `SUBTRACT($fieldA,$fieldB.0.value)` `SUBTRACT($fieldA,2)` `SUBTRACT(2,2)`

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

- `EXISTS`
  - Returns `true` if any item in a collection matches an expression, or `false` otherwise.
  - Accepts the following parameters:
    - **value**: A collection or a reference to a collection field (i.e. `$collection`).
    - **expression**: The expression used to filter each item in the collection (i.e. `($ LIKE ^\\d+$)`). The expression must be wrapped in parentheses for parsing.
  - `EXISTS($, ($ >= 4))` `EXISTS($items, ($sku LIKE ^\\d+-\\w+$))`
- `FILTER`
  - Filters the items of a collection based on an expression.
  - Accepts the following parameters:
    - **value**: A collection or a reference to a collection field (i.e. `$collection`).
    - **expression**: The expression used to filter each item in the collection (i.e. `($ LIKE ^\\d+$)`). The expression must be wrapped in parentheses for parsing.
  - `FILTER($, ($ >= 4))` `FILTER($items, ($sku LIKE ^\\d+-\\w+$))`
- `GET`
  - Retrieves a value from a collection at a given path.
  - Accepts the following parameters:
    - **collection**: The collection.
    - **path**: The path to the value in the collection.
  - `GET($items, "$0.sku")` `GET(FILTER($, ($ >= 2)), "$0")`
- `LAST`
  - Returns the last element in an array.
  - `LAST($items)` `LAST($)`
- `MAX`
  - Returns the element with the largest value in a collection (or group of collections).
  - `MAX($a,$b,1,2,3)` `MAX($c)`
- `MIN`
  - Returns the element with the smallest value in a collection (or group of collections).
  - `MIN($a,$b,1,2,3)` `MIN($c)`
- `SIZE`
  - Returns the size of a collection.
  - `SIZE($)` `SIZE($items)`

#### Date Functions

- `DATECOMP`
  - Compares two dates and returns `true` or `false` based on the comparison result.
  - Accepts the following parameters:
    - **dateA (required)**: The first date being compared.
    - **dateB (required)**: The second date being compared.
    - The following arguments may be optionally passed as flags in any order:
      - **format**: The format used to parse both dates. Defaults to ISO 8601.
      - **formatA**: The format used to parse the first date. Defaults to ISO 8601.
      - **formatB**: The format used to parse the second date. Defaults to ISO 8601.
      - **timezone**: The timezone used to parse both dates. Defaults to UTC.
      - **timezoneA**: The timezone used to parse the first date. Defaults to UTC.
      - **timezoneB**: The timezone used to parse the second date. Defaults to UTC.
      - **operator**: The comparison operator used to compare the dates. Defaults to `=`.
        - Allowed values include `=`, `>`, `>=`, `<`, `<=`.
      - **unit**: The unit of comparison. Defaults to `day`.
        - Allowed values include `year`, `quarter`, `month`, `week`, `day`, `hour`, `minute`, `second`, `millisecond`.
  - **dateA** and **dateB** may reference the current date by using the `NOW` value.
    - Intervals are supported with the syntax `NOW[+-]\d+[YMmDH]`.
      - `Y`: years
      - `M`: months
      - `D`: days
      - `H`: hours
      - `m`: minutes
  - `DATECOMP($a, $b, timezone=America/New_York)` `DATECOMP($a, $b, operator=>=, unit=hour)` `DATECOMP($a, NOW+1M, operator=<)`
- `DATEIVL`
  - Adds an interval to a date and returns the result.
  - Accepts the following parameters:
    - **date (required)**: The date which an interval will be applied to.
    - **interval (required)**: The interval which will be applied to a date.
      - Interval syntax follows `[+-]\d+[YMmDH]`.
      - `Y`: years
      - `M`: months
      - `D`: days
      - `H`: hours
      - `m`: minutes
    - **timezone**: The timezone used to parse the date. Defaults to UTC.
    - **format**: The format used to parse the date. Defaults to ISO 8601.
  - `DATEIVL($dateCreated, "+10D")` `DATEIVL($endDate, "-1Y")`

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
- [FragmentParser](./src/types/fragment-parser.ts)
  - Parses all fragments from a string (supports delimiters, symbols, and symbol groups). 
  - Used when parsing expressions, evaluating conditions, and evaluating functions.
- [FunctionEvaluator](./src/types/function-evaluator.ts)
  - Evaluates a function within a condition.
- [PathEvaluator](./src/types/path-evaluator.ts)
  - Retrieves values from an object given a path.