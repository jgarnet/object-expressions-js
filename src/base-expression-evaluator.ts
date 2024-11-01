import ExpressionContext from "./types/expression-context";
import ExpressionEvaluator from "./types/expression-evaluator";
import {isWrapped, unwrapString} from "./_utils";
import createContext from "./create-context";
import ExpressionNode from "./types/expression-node";

class BaseExpressionEvaluator implements ExpressionEvaluator {
    /**
     * Parses and evaluates an expression against an object to determine if all conditions apply.
     * @param initialContext The {@link ExpressionContext}.
     */
    evaluate<T>(initialContext: Partial<ExpressionContext<T>>): boolean {
        const context = createContext(initialContext);
        const expression = context.expression;
        if (!expression || expression.trim() === '') {
            throw new Error('Expression cannot be empty.');
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
    private evaluateNode<T>(node: ExpressionNode, context: ExpressionContext<T>): boolean {
        let result;
        if (context.cache.has(node.token)) {
            result = context.cache.get(node.token) as boolean;
        } else {
            const isGroup = isWrapped(node.token, '(', ')');
            if (isGroup) {
                const token = unwrapString(node.token, '(', ')');
                // https://youtrack.jetbrains.com/issue/WEB-36766
                // noinspection TypeScriptValidateTypes
                const newContext: ExpressionContext<T> = createContext({
                    expression: token,
                    object: context.object,
                    cache: context.cache,
                    operators: context.operators,
                    functions: context.functions,
                    functionRegex: context.functionRegex,
                    debug: context.debug,
                    nestLevel: context.nestLevel + 1
                });
                result = this.evaluate(newContext);
            } else {
                result = context.conditionEvaluator.evaluate(node.token, context);
                context.cache.set(node.token, result);
            }
        }
        if (node.negate) {
            result = !result;
        }
        if (node.next) {
            if (node.next.relationship === 'AND') {
                if (result) {
                    result = this.evaluateNode(node.next.node, context);
                }
            } else {
                if (!result) {
                    result = this.evaluateNode(node.next.node, context);
                }
            }
        }
        return result;
    }
}

export default BaseExpressionEvaluator;