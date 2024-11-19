import ExpressionContext from "./types/expression-context";
import ExpressionEvaluator from "./types/expression-evaluator";
import {CONSOLE_COLORS, debug, isWrapped, unwrapValue} from "./_utils";
import createContext from "./create-context";
import ExpressionNode from "./types/expression-node";
import ExpressionError from "./expression-error";

class BaseExpressionEvaluator implements ExpressionEvaluator {
    /**
     * Parses and evaluates an expression against an object to determine if all conditions apply.
     * @param initialContext The {@link ExpressionContext}.
     */
    async evaluate<T>(initialContext: Partial<ExpressionContext<T>>): Promise<boolean> {
        const context = createContext(initialContext);
        const expression = context.expression;
        if (!expression || expression.trim() === '') {
            throw new ExpressionError('Expression cannot be empty.');
        }
        const node = context.expressionParser.parse(context);
        return this.evaluateNode(node, context);
    }

    /**
     * Evaluates a token to determine whether the condition(s) apply to the supplied object.
     * @param node The {@link ExpressionNode}.
     * @param context The {@link ExpressionContext}.
     * @private
     */
    private async evaluateNode<T>(node: ExpressionNode, context: ExpressionContext<T>): Promise<boolean> {
        let result;
        if (context.cache.has(node.token)) {
            result = context.cache.get(node.token) as boolean;
        } else {
            const isGroup = isWrapped(node.token, '(', ')');
            if (isGroup) {
                const token = unwrapValue(node.token, '(', ')');
                const newContext: ExpressionContext<T> = createContext({
                    expression: token,
                    object: context.object,
                    expressionEvaluator: context.expressionEvaluator,
                    pathEvaluator: context.pathEvaluator,
                    conditionEvaluator: context.conditionEvaluator,
                    expressionParser: context.expressionParser,
                    functionEvaluator: context.functionEvaluator,
                    fragmentParser: context.fragmentParser,
                    cache: context.cache,
                    operators: context.operators,
                    operatorDelimiters: context.operatorDelimiters,
                    standardTokens: context.standardTokens,
                    functions: context.functions,
                    debug: context.debug,
                    nestLevel: context.nestLevel + 1
                });
                result = await this.evaluate(newContext);
            } else {
                result = await context.conditionEvaluator.evaluate(node.token, context);
                context.cache.set(node.token, result);
            }
        }
        if (node.negate) {
            result = !result;
        }
        if (node.next) {
            if (node.next.relationship === 'AND') {
                if (result) {
                    debug(CONSOLE_COLORS.blue + 'AND' + CONSOLE_COLORS.reset, context);
                    result = await this.evaluateNode(node.next.node, context);
                }
            } else {
                if (!result) {
                    debug(CONSOLE_COLORS.blue + 'OR' + CONSOLE_COLORS.reset, context);
                    result = await this.evaluateNode(node.next.node, context);
                }
            }
        }
        return result;
    }
}

export default BaseExpressionEvaluator;