import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {parseNumber} from "./_utils";

const divide: ExpressionFunction = {
    evaluate<T>(context: ExpressionContext<T>, ...args: any[]): any {
        if (args.length < 2) {
            throw new Error(`SyntaxError: DIVIDE() received invalid arguments in ${context.expression}`);
        }
        let result = parseNumber('DIVIDE', args[0], context);
        for (let i = 1; i < args.length; i++) {
            const arg = args[i];
            if (arg === 0) {
                throw new Error(`EvaluationError: attempted to divide by zero in ${context.expression}`);
            }
            result /= parseNumber('DIVIDE', arg, context);
        }
        return result;
    }
};

export default divide;