import {NumberType, typeToString} from '../types';

import {typeOf} from '../values';
import {RuntimeError} from '../runtime_error';

import type {Expression} from '../expression';
import type {ParsingContext} from '../parsing_context';
import type {EvaluationContext} from '../evaluation_context';
import type {Type} from '../types';

export class Length implements Expression {
    type: Type;
    input: Expression;

    constructor(input: Expression) {
        this.type = NumberType;
        this.input = input;
    }

    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression {
        if (args.length !== 2)
            return context.error(`Expected 1 argument, but found ${args.length - 1} instead.`) as null;

        const input = context.parse(args[1], 1);
        if (!input) return null;

        if (input.type.kind !== 'array' && input.type.kind !== 'string' && input.type.kind !== 'value')
            return context.error(`Expected argument of type string or array, but found ${typeToString(input.type)} instead.`) as null;

        return new Length(input);
    }

    evaluate(ctx: EvaluationContext) {
        const input = this.input.evaluate(ctx);
        if (typeof input === 'string') {
            // The length may be affected by surrogate pairs.
            return [...input].length;
        } else if (Array.isArray(input)) {
            return input.length;
        } else {
            throw new RuntimeError(`Expected value to be of type string or array, but found ${typeToString(typeOf(input))} instead.`);
        }
    }

    eachChild(fn: (_: Expression) => void) {
        fn(this.input);
    }

    outputDefined() {
        return false;
    }
}

