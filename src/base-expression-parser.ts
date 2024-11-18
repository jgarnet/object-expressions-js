import ExpressionParser from "./types/expression-parser";
import ExpressionContext from "./types/expression-context";
import ExpressionNode from "./types/expression-node";
import SyntaxError from "./syntax-error";

class BaseExpressionParser implements ExpressionParser {
    parse<T>(context: ExpressionContext<T>): ExpressionNode {
        const expression = context.expression;
        const tokens = context.fragmentParser.parse(
            expression,
            new Set([
                { symbol: '(', closeSymbol: ')', escapable: true },
                { symbol: '[', closeSymbol: ']', escapable: true },
                { symbol: '"', escapable: true },
                { symbol: '/', escapable: true }
            ]),
            new Set([
                { symbol: 'AND', whitespace: true, include: true },
                { symbol: 'OR', whitespace: true, include: true },
                { symbol: 'NOT', whitespace: true, include: true }
            ])
        );
        return this.buildNodes(tokens, context);
    }

    /**
     * Transforms all parsed fragments into an Expression Chain using {@link ExpressionNode}.
     * @param tokens All tokens parsed from the expression.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private buildNodes<T>(tokens: string[], context: ExpressionContext<T>): ExpressionNode {
        const root: ExpressionNode = {
            token: '',
            negate: false
        };
        let current = root;
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token === 'NOT') {
                if (current.token.trim() !== '' || i + 1 >= tokens.length) {
                    throw new SyntaxError(`incomplete logical operation detected in ${context.expression}`);
                }
                current.negate = !current.negate;
            } else if (token === 'OR' || token === 'AND') {
                if (current.token.trim() === '' || i + 1 >= tokens.length) {
                    throw new SyntaxError(`incomplete logical operation detected in ${context.expression}`);
                }
                const next: ExpressionNode = {
                    token: '',
                    negate: false
                };
                current.next = {
                    node: next,
                    relationship: token
                };
                current = next;
            } else {
                current.token = token;
            }
        }
        return root;
    }
}

export default BaseExpressionParser;