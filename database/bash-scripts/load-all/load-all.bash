# Construct the database by (re)initializing all tables and functions.
psql --set=sslmode=require -h $1 -p $2 -d $3 -U $4 \
 \
    -f ../../tables/app-user/app-user-domain/app-user-type.sql \
    -f ../../tables/food-listing/food-listing-domain/food-listings-status.sql \
    -f ../../tables/food-listing/food-listing-domain/food-type.sql \
    -f ../../tables/food-listing/food-listing-domain/vehicle-type.sql \
    -f ../../tables/food-listing/delivery-info/delivery-info-domain/delivery-state.sql \
 \
    -f ../../tables/app-user/app-user.sql \
    -f ../../tables/app-user/app-user-password.sql \
    -f ../../tables/app-user/app-user-password-recovery.sql \
    -f ../../tables/app-user/app-user-availability.sql \
    -f ../../tables/app-user/contact-info.sql \
    -f ../../tables/app-user/organization.sql \
    -f ../../tables/app-user/unverified-app-user.sql \
 \
    -f ../../tables/food-listing/food-listing.sql \
    -f ../../tables/food-listing/food-listing-food-type-map.sql \
    -f ../../tables/food-listing/food-listing-img.sql \
    -f ../../tables/food-listing/removed-food-listing.sql \
    -f ../../tables/food-listing/food-listing-filters-history.sql \
 \
    -f ../../tables/food-listing/claim-info/claim-info.sql \
    -f ../../tables/food-listing/claim-info/unclaim-info.sql \
 \
    -f ../../tables/food-listing/delivery-info/delivery-info.sql \
    -f ../../tables/food-listing/delivery-info/cancelled-delivery-info.sql \
 \
    -f ../../functions/common-util/drop-function.sql \
    -f ../../functions/common-util/create-gps-coordinates.sql \
    -f ../../functions/common-util/json-arr-to-postgres-text-arr.sql \
    -f ../../functions/common-util/generate-token.sql \
 \
    -f ../../functions/date-time-util/timestamp-to-utc-text.sql \
    -f ../../functions/date-time-util/utc-text-to-timestamp.sql \
    -f ../../functions/date-time-util/to-upcoming-weekday.sql \
 \
    -f ../../functions/app-user/app-user-verification/add-unverified-app-user.sql \
    -f ../../functions/app-user/app-user-verification/verify-app-user.sql \
 \
    -f ../../functions/app-user/app-user-password-recovery/add-password-recovery-token.sql \
    -f ../../functions/app-user/app-user-password-recovery/remove-password-recovery-token.sql \
 \
    -f ../../functions/app-user/add-or-update-contact-info.sql \
    -f ../../functions/app-user/add-or-update-availability.sql \
    -f ../../functions/app-user/add-app-user.sql \
    -f ../../functions/app-user/update-app-user.sql \
    -f ../../functions/app-user/get-app-user-session-data.sql \
 \
    -f ../../functions/food-listing/deliver/get-delivery-state.sql \
    -f ../../functions/food-listing/deliver/get-delivery-update-notification.sql \
    -f ../../functions/food-listing/deliver/get-possible-delivery-times.sql \
    -f ../../functions/food-listing/deliver/schedule-delivery.sql \
    -f ../../functions/food-listing/deliver/update-delivery-state.sql \
    -f ../../functions/food-listing/deliver/cancel-delivery.sql \
 \
    -f ../../functions/food-listing/claim-unclaim/get-unclaim-notification-data.sql \
    -f ../../functions/food-listing/claim-unclaim/claim-food-listing.sql \
    -f ../../functions/food-listing/claim-unclaim/unclaim-food-listing.sql \
 \
    -f ../../functions/food-listing/get-food-listing-img-urls.sql \
    -f ../../functions/food-listing/get-food-listings.sql


if [ "$5" != "-child_script" ]
then
    read -p "Press enter to exit the shell..."
fi
