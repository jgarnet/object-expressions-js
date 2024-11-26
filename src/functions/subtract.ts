import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {convertToNumber, requireNumber} from "../utils";
import ExpressionError from "../expression-error";

const subtract: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
        if (args.length < 2) {
            throw new ExpressionError(`SUBTRACT() received invalid arguments in ${context.expression}`);
        }
        requireNumber(context, 'SUBTRACT', ...args);
        let result = convertToNumber(args[0]);
        for (let i = 1; i < args.length; i++) {
            const arg = args[i];
            result -= convertToNumber(arg);
        }
        return result;
    }
};

export default subtract;