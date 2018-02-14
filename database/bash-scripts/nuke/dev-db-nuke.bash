heroku restart --app connect-food
heroku pg:reset DATABASE_URL --app connect-food


if [ "$1" != "-child_script" ]
then
    read -p "Press enter to exit the shell..."
fi
