import ExpressionContext from "./types/expression-context";
import createContext from "./create-context";
import ExpressionError from "./expression-error";

const evaluate = async <T> (context: Partial<ExpressionContext<T>>): Promise<boolean> => {
    try {
        const ctx = createContext(context);
        return await ctx.expressionEvaluator.evaluate(ctx);
    } catch (error) {
        if (error instanceof ExpressionError) {
            throw error;
        }
        const expressionError = new ExpressionError(`Encountered runtime error when evaluating expression: ${context.expression}`);
        expressionError.cause = error as Error;
        expressionError.expression = context.expression;
        throw expressionError;
    }
};

export default evaluate;