"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExpressionEvaluator {
    constructor(conditionEvaluator, cache) {
        this.conditionEvaluator = conditionEvaluator;
        this.cache = cache !== null && cache !== void 0 ? cache : new Map();
        this.tokens = [];
        this.childExpressions = new Set();
    }
    evaluate(expression, object) {
        if (!expression || expression.trim() === '') {
            throw new Error('Expression cannot be empty.');
        }
        this.parse(expression);
        let isNegate = false;
        let isAnd = false;
        let isOr = false;
        let result = false;
        for (let i = 0; i < this.tokens.length; i++) {
            const token = this.tokens[i];
            if (token === 'NOT') {
                isNegate = true;
            }
            else if (token === 'AND') {
                isAnd = true;
            }
            else if (token === 'OR') {
                isOr = true;
            }
            else {
                let current = this.evaluateToken(token, object);
                if (isNegate) {
                    current = !current;
                    isNegate = false;
                }
                if (isAnd) {
                    isAnd = false;
                    if (!current || !result) {
                        return false;
                    }
                }
                else if (isOr) {
                    isOr = false;
                    if (!current && !result) {
                        return false;
                    }
                    current = true;
                }
                result = current;
            }
        }
        return result;
    }
    evaluateToken(token, object) {
        if (this.cache.has(token)) {
            return this.cache.get(token);
        }
        let result;
        if (this.childExpressions.has(token)) {
            result = new ExpressionEvaluator(this.conditionEvaluator, this.cache).evaluate(token, object);
        }
        else {
            result = this.conditionEvaluator.evaluate(token, object);
        }
        this.cache.set(token, result);
        return result;
    }
    parse(expression) {
        let buffer = '';
        let parenCount = 0;
        let inQuote = false;
        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
            // check for child expressions
            if (char === '(') {
                parenCount++;
                if (parenCount > 1) {
                    buffer += char;
                }
            } else if (char === ')') {
                parenCount--;
                if (parenCount === 0) {
                    // end expression
                    this.addToken(buffer);
                    this.childExpressions.add(buffer);
                    buffer = '';
                } else {
                    buffer += char;
                }
            } else if (char === '"') {
                if (!inQuote) {
                    inQuote = true;
                } else if (expression[i - 1] === '\\') {
                    buffer += char;
                } else {
                    inQuote = false;
                }
            } else if (/\s/.test(char)) {
                if (inQuote) {
                    buffer += char;
                } else {
                    buffer += ' ';
                }
            } else {
                buffer += char;
            }
            // check for operators
            if (parenCount === 0) {
                if (i + 5 < expression.length && expression.slice(i + 1, i + 5) === ' OR ') {
                    if (buffer.length > 0) {
                        this.addToken(buffer);
                    }
                    this.addToken('OR');
                    buffer = '';
                    i += 4;
                } else if (i + 6 < expression.length && expression.slice(i + 1, i + 6) === ' AND ') {
                    if (buffer.length > 0) {
                        this.addToken(buffer);
                    }
                    this.addToken('AND');
                    buffer = '';
                    i += 5;
                } else if (i + 6 < expression.length && expression.slice(i + 1, i + 6) === ' NOT ') {
                    if (buffer.length > 0) {
                        this.addToken(buffer);
                    }
                    this.addToken('NOT');
                    buffer = '';
                    i += 5;
                } else if (i + 4 < expression.length && expression.slice(i, i + 4) === 'NOT ') {
                    this.addToken('NOT');
                    buffer = '';
                    i += 3;
                }
            }
        }
        if (buffer.length > 0) {
            this.addToken(buffer);
        }
    }

    addToken(token) {
        this.tokens.push(token.trim());
    }
}
exports.default = ExpressionEvaluator;
