import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {requireString, unwrapString} from "../utils";

const upper: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
        requireString(context, 'UPPER', args[0]);
        const value = unwrapString(args[0]);
        return value.toUpperCase();
    }
};

export default upper;