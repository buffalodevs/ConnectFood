# NOTE: These credentials are for a dummy development database (non-production). Production database credentials are not made public!
server="ec2-54-83-26-65.compute-1.amazonaws.com"
port=5432
database="dboab0kq8r4usn"
username="vvbtixriggqnkz"
export PGPASSWORD=dda3a35edddd2ccb79bafa2bdddad61531827529d4c78c9843a0c02aa17c5660


# WARNING: The -nuke_database argument will literally drop and recreate the entire development database (destroying all data)!
if [ "$1" == "-nuke_database" ]
then
    echo "=== Warning: If you confirm this action, then all development data will be lost!"
    heroku pg:reset DATABASE_URL -a connect-food
fi


# Construct the database by (re)initializing all tables and functions.
psql --set=sslmode=require -h $server -p $port -d $database -U $username \
 \
    -f tables/app-user/app-user.sql \
    -f tables/app-user/app-user-password.sql \
    -f tables/app-user/app-user-password-recovery.sql \
    -f tables/app-user/app-user-availability \
    -f tables/app-user/contact-info.sql \
    -f tables/app-user/organization.sql \
    -f tables/app-user/unverified-app-user.sql \
 \
    -f tables/food-listing/food-listing.sql \
    -f tables/food-listing/claimed-food-listing.sql \
    -f tables/food-listing/delivery-food-listing.sql \
    -f tables/food-listing/cancelled-delivery-food-listing.sql \
    -f tables/food-listing/food-type.sql \
    -f tables/food-listing/food-listing-food-type-map.sql \
    -f tables/food-listing/vehicle-type.sql \
    -f tables/food-listing/food-listing-images.sql \
 \
    -f functions/common-util/drop-function.sql \
    -f functions/common-util/weekday-int-to-text.sql \
    -f functions/common-util/weekday-text-to-int.sql \
    -f functions/common-util/generate-token.sql \
    -f functions/common-util/create-gps-coordinates.sql \
 \
    -f functions/app-user/add-unverified-app-user.sql \
    -f functions/app-user/verify-app-user.sql \
    -f functions/app-user/add-contact-info.sql \
    -f functions/app-user/add-password-recovery-token.sql \
    -f functions/app-user/add-app-user.sql \
    -f functions/app-user/get-app-user-session-data.sql \
    -f functions/app-user/update-contact-info.sql \
    -f functions/app-user/update-availability \
    -f functions/app-user/update-app-user.sql \
    -f functions/app-user/remove-password-recovery-token.sql \
 \
    -f functions/food-listing/units-count-heuristics/get-available-units-count.sql \
    -f functions/food-listing/units-count-heuristics/get-donor-on-hand-units-count.sql \
    -f functions/food-listing/units-count-heuristics/get-total-units-count.sql \
    -f functions/food-listing/units-count-heuristics/get-user-claimed-units-count.sql \
 \
    -f functions/food-listing/get-food-listings.sql \
    -f functions/food-listing/get-claimer-info.sql \
    -f functions/food-listing/donate/add-food-listing.sql \
    -f functions/food-listing/donate/remove-food-listing.sql \
    -f functions/food-listing/donate/update-food-listing.sql \
    -f functions/food-listing/claim/claim-food-listing.sql \
    -f functions/food-listing/claim/unclaim-food-listing.sql \
    -f functions/food-listing/delivery/start-food-listing-delivery.sql \
    -f functions/food-listing/delivery/cancel-food-listing-delivery.sql \
    -f functions/food-listing/delivery/mark-food-listing-pick-up.sql \
    -f functions/food-listing/delivery/mark-food-listing-drop-off.sql \
    -f functions/food-listing/delivery/get-delivery-state.sql \
    -f functions/food-listing/delivery/get-delivery-food-listings.sql \
    -f functions/food-listing/delivery/get-possible-delivery-times.sql
