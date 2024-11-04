import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {requireString, unwrapString} from "../_utils";

const lower: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
        requireString(context, 'LOWER', args[0]);
        const value = unwrapString(args[0]);
        return value.toLowerCase();
    }
};

export default lower;