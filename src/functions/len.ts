import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {unwrapString} from "../_utils";
import ExpressionError from "../expression-error";

const len: ExpressionFunction = {
    evaluate<T>(context: ExpressionContext<T>, ...args: any[]): any {
        if (typeof args[0] !== 'string') {
            throw new ExpressionError(`LEN() received non-string argument in expression: ${context.expression}`);
        }
        const value = unwrapString(args[0]);
        return `${value ?? ''}`.length;
    }
};

export default len;