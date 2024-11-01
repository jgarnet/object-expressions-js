/**
 * Represents a Node in an Expression.
 */
type ExpressionNode = {
    token: string;
    negate?: boolean;
    next?: {
        node: ExpressionNode;
        relationship: 'AND' | 'OR';
    };
};

export default ExpressionNode;