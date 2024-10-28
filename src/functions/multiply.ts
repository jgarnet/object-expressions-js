import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {parseNumber} from "../_utils";

const multiply: ExpressionFunction = {
    evaluate<T>(context: ExpressionContext<T>, ...args: any[]): any {
        if (args.length < 2) {
            throw new Error(`SyntaxError: MULTIPLY() received invalid arguments in ${context.expression}`);
        }
        let result = parseNumber('MULTIPLY', args[0], context);
        for (let i = 1; i < args.length; i++) {
            const arg = args[i];
            result *= parseNumber('MULTIPLY', arg, context);
        }
        return result;
    }
};

export default multiply;