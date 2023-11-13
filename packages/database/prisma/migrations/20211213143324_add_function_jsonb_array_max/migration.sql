-- Function to find the maximum value of a jsonb numeric array

CREATE OR REPLACE FUNCTION jsonb_array_max(arr jsonb)
	RETURNS integer
	IMMUTABLE
	LANGUAGE plpgsql
	AS $$
BEGIN
	RETURN (WITH el AS (
		SELECT
			max(jsonb_array_elements::int)
		FROM
			jsonb_array_elements(arr)
)
SELECT
	*
FROM
	el LIMIT 1 );
END;
$$;