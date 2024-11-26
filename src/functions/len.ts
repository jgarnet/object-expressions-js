import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {requireString, unwrapString} from "../utils";

const len: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
        requireString(context, 'LEN', args[0]);
        const value = unwrapString(args[0]);
        return `${value ?? ''}`.length;
    }
};

export default len;