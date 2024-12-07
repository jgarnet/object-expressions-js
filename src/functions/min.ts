import ExpressionFunction from "../types/expression-function";
import {comparePrimitives, isCollection} from "../utils";
import FunctionContext from "../types/function-context";

const min: ExpressionFunction = {
    async evaluate<T>(ctx: FunctionContext<T>): Promise<any> {
        const { args, context } = ctx;
        const allItems = [];
        for (const arg of args) {
            if (isCollection(arg)) {
                allItems.push(...arg);
            } else {
                allItems.push(arg);
            }
        }
        let min = null;
        for (const item of allItems) {
            if (min === null || comparePrimitives(item, min, context) === -1) {
                min = item;
            }
        }
        return min;
    }
};

export default min;