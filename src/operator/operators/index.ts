import ComparisonOperator from "../comparison-operator";
import equals from "./equals/equals";
import greaterThan from "./greater-than/greater-than";
import is from "./is/is";
import lessThan from "./less-than/less-than";
import _in from "./in/in";
import greaterEquals from "./greater-equals/greater-equals";
import lessEquals from "./less-equals/less-equals";
import like from "./like/like";
import has from "./has/has";

const operators = new Map<string, ComparisonOperator>;
operators.set('=', equals);
operators.set('>', greaterThan);
operators.set('<', lessThan);
operators.set('>=', greaterEquals);
operators.set('<=', lessEquals);
operators.set('IN', _in);
operators.set('IS', is);
operators.set('LIKE', like);
operators.set('HAS', has);

export default operators;