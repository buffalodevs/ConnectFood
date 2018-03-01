SELECT dropFunction ('timestampToUtcText');

/**
 * Converts a PostgreSQL TIMESTAMPTZ to a UTC format (JavaScript) time string.
 */
CREATE OR REPLACE FUNCTION timestampToUtcText
(
    _timestampToConvert TIMESTAMPTZ
)
RETURNS TEXT
AS $$

    SELECT TO_CHAR(_timestampToConvert::TIMESTAMP, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')::TEXT;

$$ LANGUAGE sql;
