import ComparisonOperator from "../types/comparison-operator";
import equals from "./equals";
import greaterThan from "./greater-than";
import is from "./is";
import lessThan from "./less-than";
import _in from "./in";
import greaterEquals from "./greater-equals";
import lessEquals from "./less-equals";
import like from "./like";

const operators = new Map<string, ComparisonOperator>;
operators.set('=', equals);
operators.set('>', greaterThan);
operators.set('<', lessThan);
operators.set('>=', greaterEquals);
operators.set('<=', lessEquals);
operators.set('IN', _in);
operators.set('IS', is);
operators.set('LIKE', like);

export default operators;