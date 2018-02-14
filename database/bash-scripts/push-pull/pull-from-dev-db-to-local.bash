# First destroy and re-create database.
../nuke/local-db-nuke.bash "-child_script"
echo "Finished nuking/re-creating database, now dumping Heroku Dev database contents in local binary heroku.dump file..."

# Dump Heroku Dev database contents in local dump file.
pg_dump --verbose -F c -Z 0 -U vvbtixriggqnkz -h ec2-54-83-26-65.compute-1.amazonaws.com -p 5432 dboab0kq8r4usn > heroku.dump
echo "Finished dumping heroku dev database contents, now restoring them locally..."

# Restore the dump file binary contents to the local database.
pg_restore --verbose --no-acl --no-owner -U postgres -h localhost -p 5432 -d dboab0kq8r4usn < heroku.dump
read -p "Press enter to exit the shell..."

# Remove dump file from file system.
rm ./heroku.dump
