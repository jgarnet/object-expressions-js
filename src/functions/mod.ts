import ExpressionFunction from "../types/expression-function";
import {convertToNumber, requireNumber} from "../utils";
import ExpressionError from "../expression-error";
import FunctionContext from "../types/function-context";

const mod: ExpressionFunction = {
    async evaluate<T>(ctx: FunctionContext<T>): Promise<any> {
        const { args, context } = ctx;
        if (args.length !== 2) {
            throw new ExpressionError('MOD() requires two numeric arguments');
        }
        requireNumber(context, 'MOD', args[0], args[1]);
        const a = convertToNumber(args[0]);
        const b = convertToNumber(args[1]);
        if (b === 0) {
            throw new ExpressionError('MOD(): cannot divide by zero');
        }
        return a % b;
    }
};

export default mod;