import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {requireString, unwrapString} from "../_utils";

const lower: ExpressionFunction = {
    evaluate<T>(context: ExpressionContext<T>, ...args: any[]): any {
        requireString(context, 'LOWER', args[0]);
        const value = unwrapString(args[0]);
        return value.toLowerCase();
    }
};

export default lower;