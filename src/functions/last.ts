import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {requireArray} from "../utils";

const last: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
        requireArray(context, 'LAST', args[0]);
        const collection = args[0];
        return collection[collection.length - 1];
    }
};

export default last;