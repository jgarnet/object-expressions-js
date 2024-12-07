import ExpressionFunction from "../types/expression-function";
import {requireString, unwrapString} from "../utils";
import FunctionContext from "../types/function-context";

const lower: ExpressionFunction = {
    async evaluate<T>(ctx: FunctionContext<T>): Promise<any> {
        const { args, context } = ctx;
        requireString(context, 'LOWER', args[0]);
        const value = unwrapString(args[0]);
        return value.toLowerCase();
    }
};

export default lower;