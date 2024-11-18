import ExpressionFunction from "../types/expression-function";
import ExpressionContext from "../types/expression-context";
import {comparePrimitives, isCollection} from "../_utils";

const min: ExpressionFunction = {
    async evaluate<T>(context: ExpressionContext<T>, ...args: any[]): Promise<any> {
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