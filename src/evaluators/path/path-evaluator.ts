/**
 * Retrieves a value from an object given a path.
 */
type PathEvaluator = {
    evaluate <T, R> (object: T, path: string): R
};

export default PathEvaluator;