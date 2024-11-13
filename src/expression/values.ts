
import {Color} from './types/color';
import {Collator} from './types/collator';
import {Formatted} from './types/formatted';
import {Padding} from './types/padding';
import {VariableAnchorOffsetCollection} from './types/variable_anchor_offset_collection';
import {ResolvedImage} from './types/resolved_image';
import {NullType, NumberType, StringType, BooleanType, ColorType, ObjectType, ValueType, CollatorType, FormattedType, ResolvedImageType, array, PaddingType, VariableAnchorOffsetCollectionType, ProjectionDefinitionType} from './types';

import type {Type} from './types';
import ProjectionDefinition from './types/projection_definition';

export function validateRGBA(r: unknown, g: unknown, b: unknown, a?: unknown): string | null {
    if (!(
        typeof r === 'number' && r >= 0 && r <= 255 &&
        typeof g === 'number' && g >= 0 && g <= 255 &&
        typeof b === 'number' && b >= 0 && b <= 255
    )) {
        const value = typeof a === 'number' ? [r, g, b, a] : [r, g, b];
        return `Invalid rgba value [${value.join(', ')}]: 'r', 'g', and 'b' must be between 0 and 255.`;
    }

    if (!(
        typeof a === 'undefined' || (typeof a === 'number' && a >= 0 && a <= 1)
    )) {
        return `Invalid rgba value [${[r, g, b, a].join(', ')}]: 'a' must be between 0 and 1.`;
    }

    return null;
}

export type Value = null | string | boolean | number | Color | ProjectionDefinition | Collator | Formatted | Padding | ResolvedImage | VariableAnchorOffsetCollection | ReadonlyArray<Value> | {
    readonly [x: string]: Value;
};

export function isValue(mixed: unknown): boolean {
    if (mixed === null ||
        typeof mixed === 'string' ||
        typeof mixed === 'boolean' ||
        typeof mixed === 'number' ||
        mixed instanceof ProjectionDefinition ||
        mixed instanceof Color ||
        mixed instanceof Collator ||
        mixed instanceof Formatted ||
        mixed instanceof Padding ||
        mixed instanceof VariableAnchorOffsetCollection ||
        mixed instanceof ResolvedImage) {
        return true;
    } else if (Array.isArray(mixed)) {
        for (const item of mixed) {
            if (!isValue(item)) {
                return false;
            }
        }
        return true;
    } else if (typeof mixed === 'object') {
        for (const key in mixed) {
            if (!isValue(mixed[key])) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}

export function typeOf(value: Value): Type {
    if (value === null) {
        return NullType;
    } else if (typeof value === 'string') {
        return StringType;
    } else if (typeof value === 'boolean') {
        return BooleanType;
    } else if (typeof value === 'number') {
        return NumberType;
    } else if (value instanceof Color) {
        return ColorType;
    } else if (value instanceof ProjectionDefinition) {
        return ProjectionDefinitionType;
    } else if (value instanceof Collator) {
        return CollatorType;
    } else if (value instanceof Formatted) {
        return FormattedType;
    } else if (value instanceof Padding) {
        return PaddingType;
    } else if (value instanceof VariableAnchorOffsetCollection) {
        return VariableAnchorOffsetCollectionType;
    } else if (value instanceof ResolvedImage) {
        return ResolvedImageType;
    } else if (Array.isArray(value)) {
        const length = value.length;
        let itemType: Type | typeof undefined;

        for (const item of value) {
            const t = typeOf(item);
            if (!itemType) {
                itemType = t;
            } else if (itemType === t) {
                continue;
            } else {
                itemType = ValueType;
                break;
            }
        }

        return array(itemType || ValueType, length);
    } else {
        return ObjectType;
    }
}

export function valueToString(value: Value) {
    const type = typeof value;
    if (value === null) {
        return '';
    } else if (type === 'string' || type === 'number' || type === 'boolean') {
        return String(value);
    } else if (value instanceof Color || value instanceof ProjectionDefinition || value instanceof Formatted || value instanceof Padding || value instanceof VariableAnchorOffsetCollection || value instanceof ResolvedImage) {
        return value.toString();
    } else {
        return JSON.stringify(value);
    }
}
