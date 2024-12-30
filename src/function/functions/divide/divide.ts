import ExpressionFunction from "../../expression-function";
import ExpressionError from "../../../errors/expression-error";
import {convertToNumber, requireNumber} from "../../../utils";
import FunctionContext from "../../context/function-context";

const divide: ExpressionFunction = {
    async evaluate<T>(ctx: FunctionContext<T>): Promise<any> {
        const { args, context } = ctx;
        if (args.length < 2) {
            throw new ExpressionError(`DIVIDE() received invalid arguments in ${context.expression}`);
        }
        requireNumber(context, 'DIVIDE', ...args);
        let result = convertToNumber(args[0]);
        for (let i = 1; i < args.length; i++) {
            const arg = args[i];
            if (arg === 0) {
                throw new ExpressionError(`attempted to divide by zero in ${context.expression}`);
            }
            result /= convertToNumber(arg);
        }
        return result;
    }
};

export default divide;