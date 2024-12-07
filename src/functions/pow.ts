import ExpressionFunction from "../types/expression-function";
import ExpressionError from "../expression-error";
import {convertToNumber, requireNumber} from "../utils";
import FunctionContext from "../types/function-context";

const pow: ExpressionFunction = {
    async evaluate<T>(ctx: FunctionContext<T>): Promise<any> {
        const { args, context } = ctx;
        if (!args || args.length !== 2) {
            throw new ExpressionError(`POW() received invalid arguments in ${context.expression}`);
        }
        requireNumber(context, 'POW', ...args);
        return Math.pow(convertToNumber(args[0]), convertToNumber(args[1]));
    }
};

export default pow;