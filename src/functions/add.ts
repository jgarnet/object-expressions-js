import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {parseNumber} from "../utils";
import ExpressionError from "../expression-error";

const add: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
        if (args.length < 2) {
            throw new ExpressionError(`ADD() received invalid arguments in ${context.expression}`);
        }
        let result = parseNumber('ADD', args[0], context);
        for (let i = 1; i < args.length; i++) {
            const arg = args[i];
            result += parseNumber('ADD', arg, context);
        }
        return result;
    }
};

export default add;