import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {getField, unwrapString} from "../_utils";

const len: ExpressionFunction = {
    evaluate<T>(context: ExpressionContext<T>, ...args: any[]): any {
        const value = unwrapString(args[0]);
        return `${value ?? ''}`.length;
    }
};

export default len;