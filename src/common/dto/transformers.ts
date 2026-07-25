/**
 * `@Transform` callbacks shared by the DTOs.
 *
 * Every one of them leaves non string input untouched so the validator, not the
 * transformer, reports the wrong type.
 */

/** Trims free text, for example a search term. */
export const trimValue = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value;

/** Trims and lower cases identifier-like values: permission and role names. */
export const normalizeIdentifier = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value;

/** An empty description means "no description", not an empty string. */
export const normalizeDescription = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? (value.trim() || null) : value;

/**
 * Query strings carry booleans as text, so `true`/`false` and `1`/`0` are both
 * accepted. Anything else is passed through for `@IsBoolean()` to reject.
 */
export const toOptionalBoolean = ({ value }: { value: unknown }) => {
    if (value === 'true' || value === '1' || value === true) return true;
    if (value === 'false' || value === '0' || value === false) return false;

    return value;
};
