import ExpressionFunction from "../types/expression-function";
import {convertToNumber, requireNumber} from "../utils";
import ExpressionError from "../expression-error";
import FunctionContext from "../types/function-context";

const add: ExpressionFunction = {
    async evaluate<T>(ctx: FunctionContext<T>): Promise<any> {
        const { args, context } = ctx;
        if (args.length < 2) {
            throw new ExpressionError(`ADD() received invalid arguments in ${context.expression}`);
        }
        requireNumber(context, 'ADD', ...args);
        let result = convertToNumber(args[0]);
        for (let i = 1; i < args.length; i++) {
            const arg = args[i];
            result += convertToNumber(arg);
        }
        return result;
    }
};

export default add;