import ExpressionFunction from "../../expression-function";
import {convertToNumber, requireNumber} from "../../../utils";
import ExpressionError from "../../../errors/expression-error";
import FunctionContext from "../../context/function-context";

const multiply: ExpressionFunction = {
    async evaluate<T>(ctx: FunctionContext<T>): Promise<any> {
        const { args, context } = ctx;
        if (args.length < 2) {
            throw new ExpressionError(`MULTIPLY() received invalid arguments in ${context.expression}`);
        }
        requireNumber(context, 'MULTIPLY', ...args);
        let result = convertToNumber(args[0]);
        for (let i = 1; i < args.length; i++) {
            const arg = args[i];
            result *= convertToNumber(arg);
        }
        return result;
    }
};

export default multiply;