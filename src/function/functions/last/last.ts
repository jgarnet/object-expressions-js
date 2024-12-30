import ExpressionFunction from "../../expression-function";
import {requireArray} from "../../../utils";
import FunctionContext from "../../context/function-context";

const last: ExpressionFunction = {
    async evaluate<T>(ctx: FunctionContext<T>): Promise<any> {
        const { args, context } = ctx;
        requireArray(context, 'LAST', args[0]);
        const collection = args[0];
        return collection[collection.length - 1];
    }
};

export default last;