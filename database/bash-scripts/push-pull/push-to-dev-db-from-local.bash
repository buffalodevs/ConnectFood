# First, nuke/re-create Heroku Dev database (implicitly will prompt user for y/n).
../nuke/dev-db-nuke.bash "-child_script"
echo "Finished nuking/re-creating Heroku Dev database, now dumping local database binary in local heroku.dump file..."

# Dump local database contents in local dump file.
pg_dump --verbose -F c -Z 0 -U postgres -h localhost -p 5432 dboab0kq8r4usn > heroku.dump
echo "Finished dumping local database contents, now restoring them in Heroku Dev database..."

# Restore the dump file binary contents to the Heroku Dev database.
pg_restore --verbose --no-acl --no-owner -U vvbtixriggqnkz -h ec2-54-83-26-65.compute-1.amazonaws.com  -p 5432 -d dboab0kq8r4usn < heroku.dump
read -p "Press enter to exit the shell..."

# Remove dump file from file system.
rm ./heroku.dump

# Restart Heroku again to ensure changes are synced up in an atomic manner.
heroku restart --app connect-food
