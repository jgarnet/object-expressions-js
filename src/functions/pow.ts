import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import ExpressionError from "../expression-error";
import {parseNumber} from "../_utils";

const pow: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
        if (!args || args.length !== 2) {
            throw new ExpressionError(`POW() received invalid arguments in ${context.expression}`);
        }
        return Math.pow(parseNumber('POW', args[0], context), parseNumber('POW', args[1], context));
    }
};

export default pow;