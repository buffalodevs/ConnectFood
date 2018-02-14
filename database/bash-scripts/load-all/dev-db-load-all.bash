# NOTE: These credentials are for a dummy development database (non-production). Production database credentials are not made public!
host="ec2-54-83-26-65.compute-1.amazonaws.com"
port=5432
database="dboab0kq8r4usn"
username="vvbtixriggqnkz"


# WARNING: The -nuke_database argument will literally drop and recreate the entire dev database (destroying all data)!
if [ "$1" == "-nuke_database" ]
then
    ../nuke/dev-db-nuke.bash "-child_script"
fi


./load-all.bash "$host" "$port" "$database" "$username" "-child_script"
read -p "Press enter to exit the shell..."
