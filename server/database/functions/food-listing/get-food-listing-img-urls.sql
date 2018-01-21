SELECT dropFunction('getFoodListingImgUrls');
CREATE OR REPLACE FUNCTION getFoodListingImgUrls
(
    _foodListingKey FoodListing.foodListingKey%TYPE
)
RETURNS TEXT[]
AS $$

    SELECT      ARRAY_AGG(FoodListingImg.imgUrl)
    FROM        FoodListingImg
    WHERE       FoodListingImg.foodListingKey = _foodListingKey
    GROUP BY    FoodListingImg.isPrimary, FoodListingImg.foodListingImgKey
    ORDER BY    FoodListingImg.isPrimary DESC,
                FoodListingImg.foodListingImgKey

$$ LANGUAGE sql;


-- SELECT * FROM getFoodListingImgUrls(2);
