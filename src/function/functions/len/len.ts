import ExpressionFunction from "../../expression-function";
import {requireString, unwrapString} from "../../../utils";
import FunctionContext from "../../context/function-context";

const len: ExpressionFunction = {
    async evaluate<T>(ctx: FunctionContext<T>): Promise<any> {
        const { args, context } = ctx;
        requireString(context, 'LEN', args[0]);
        const value = unwrapString(args[0]);
        return `${value ?? ''}`.length;
    }
};

export default len;