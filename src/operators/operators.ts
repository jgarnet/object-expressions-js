import Operator from "../types/operator";
import equals from "./equals";
import greaterThan from "./greater-than";
import is from "./is";
import lessThan from "./less-than";
import _in from "./in";

const operators = new Map<string, Operator>;
operators.set('=', equals);
operators.set('>', greaterThan);
operators.set('<', lessThan);
operators.set('IN', _in);
operators.set('IS', is);

export default operators;