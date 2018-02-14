SELECT dropFunction ('jsonArrToPostgresTextArr');

CREATE OR REPLACE FUNCTION jsonArrToPostgresTextArr
(
    _jsonArr JSON
)
RETURNS TEXT[]
AS $$
BEGIN

    RETURN  CASE WHEN (JSON_TYPEOF(_jsonArr) <> 'null')
                THEN (
                    SELECT  array_agg(arrMem)
                    FROM    JSON_ARRAY_ELEMENTS_TEXT(_jsonArr) AS arrMem
                )
                ELSE NULL
            END;

END;
$$ LANGUAGE plpgsql;


SELECT * FROM jsonArrToPostgresTextArr(NULL);
SELECT * FROM jsonArrToPostgresTextArr('["abc", "xyz"]');
