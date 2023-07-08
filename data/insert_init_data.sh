#!/bin/bash

MYSQL_CONTAINER_NAME="car_easy_life"
MYSQL_USER="root"
MYSQL_PASSWORD_FILE="/run/secrets/mysql_root_password"
MYSQL_ROOT_PASSWORD="root"
MYSQL_DATABASE="car_easy_life"

SQL_FILE_CARS="cars.sql"
SQL_FILE_IMG_CARS="image_cars.sql"
SQL_FILE_LOCATIONS="locations.sql"
SQL_FILE_USERS="users.sql"

# Function to execute SQL file using MySQL command
execute_sql_file() {
  docker exec -i "$MYSQL_CONTAINER_NAME" mysql -u "$MYSQL_USER" -p "$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < "$1"
}

# Execute SQL files
execute_sql_file "$SQL_FILE_CARS"
execute_sql_file "$SQL_FILE_IMG_CARS"
execute_sql_file "$SQL_FILE_LOCATIONS"
execute_sql_file "$SQL_FILE_USERS"

