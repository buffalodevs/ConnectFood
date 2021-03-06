CREATE OR REPLACE FUNCTION dropfunction(functionname text)
  RETURNS text AS
$BODY$
DECLARE
    funcrow RECORD;
    numfunctions smallint := 0;
    numparameters int;
    i int;
    paramtext text;
BEGIN
FOR funcrow IN SELECT proargtypes FROM pg_proc WHERE proname = LOWER(functionname) LOOP

    --for some reason array_upper is off by one for the oidvector type, hence the +1
    numparameters = array_upper(funcrow.proargtypes, 1) + 1;

    i = 0;
    paramtext = '';

    LOOP
        IF i < numparameters THEN
            IF i > 0 THEN
                paramtext = paramtext || ', ';
            END IF;
            paramtext = paramtext || (SELECT typname FROM pg_type WHERE oid = funcrow.proargtypes[i]);
            i = i + 1;
        ELSE
            EXIT;
        END IF;
    END LOOP;

    EXECUTE 'DROP FUNCTION ' || LOWER(functionname) || '(' || paramtext || ');';
    numfunctions = numfunctions + 1;

END LOOP;

RETURN 'Dropped ' || numfunctions || ' functions';
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;