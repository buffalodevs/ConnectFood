SELECT dropFunction ('utcTextToTimestamp');

/**
 * Converts UTC format time text (from Node.js) to a PostgreSQL TIMESTAMP.
 */
CREATE OR REPLACE FUNCTION utcTextToTimestamp
(
    _utcText TEXT
)
RETURNS TIMESTAMPTZ
AS $$

    SELECT TO_TIMESTAMP(_utcText, 'YYYY-MM-DD"T"HH24:MI:SS"Z"');

$$ LANGUAGE sql;
