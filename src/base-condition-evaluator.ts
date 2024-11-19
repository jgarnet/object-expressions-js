import ConditionEvaluator from "./types/condition-evaluator";
import ExpressionContext from "./types/expression-context";
import ComparisonOperator from "./types/comparison-operator";
import {CONSOLE_COLORS, debug, getField} from "./_utils";
import SyntaxError from "./syntax-error";
import ExpressionError from "./expression-error";

class BaseConditionEvaluator implements ConditionEvaluator {
    async evaluate<T>(token: string, context: ExpressionContext<T>): Promise<boolean> {
        const tokens = this.getTokens(token, context);
        if (this.isSingleFunctionCall(tokens, context)) {
            // allow a single function call to be evaluated if boolean result is returned
            const result = await context.functionEvaluator.evaluate(tokens[0], context);
            if (result !== true && result !== false) {
                throw new ExpressionError(`Cannot evaluate truthiness of ${result} in ${context.expression}`);
            }
            debug(CONSOLE_COLORS.blue + tokens[0] + CONSOLE_COLORS.reset + ' = ' +
                (result ? CONSOLE_COLORS.green : CONSOLE_COLORS.red) + result + CONSOLE_COLORS.reset,
                context
            );
            return result as boolean;
        }
        if (tokens.length !== 3 || tokens[0].length === 0 || tokens[1].length === 0 || tokens[2].length === 0) {
            throw new SyntaxError(`Received invalid condition ${token}`);
        }
        const leftSide = await this.evaluateOperand(tokens[0], context);
        const rightSide = await this.evaluateOperand(tokens[2], context);
        const _operator = context.operators.get(tokens[1]) as ComparisonOperator;
        const result = await _operator.evaluate(leftSide, rightSide, context);
        debug(CONSOLE_COLORS.blue + token + CONSOLE_COLORS.reset + ' = ' +
            (result ? CONSOLE_COLORS.green : CONSOLE_COLORS.red) + result + CONSOLE_COLORS.reset,
            context
        );
        return result;
    }

    /**
     * Extracts the operator and operands from the condition operation.
     * @param token The condition operation.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private getTokens<T>(token: string, context: ExpressionContext<T>): string[] {
        return context.fragmentParser.parse(
            token,
            context.standardTokens,
            context.operatorDelimiters
        );
    }

    /**
     * Evaluates and returns the value of an operand.
     * @param token The operand.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private async evaluateOperand<T>(token: string, context: ExpressionContext<T>): Promise<any> {
        if (token.startsWith('$')) {
            // the operand is a field or object reference -- return the result
            return getField(token, context);
        }
        if (context.functionEvaluator.isFunction(token, context)) {
            // the operand is a function call -- return the result
            return context.functionEvaluator.evaluate(token, context);
        }
        // the operand is some primitive or other value -- return as-is
        return token;
    }

    /**
     * Determines if the condition is composed of a single function call.
     * @param tokens The condition tokens (left-side operand, operator, right-side operand).
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private isSingleFunctionCall<T>(tokens: string[], context: ExpressionContext<T>): boolean {
        return tokens.length === 1 && context.functionEvaluator.isFunction(tokens[0], context);
    }
}

export default BaseConditionEvaluator;