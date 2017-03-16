#! /bin/bash
#cp /app/infrastructure/config/epel.repo /etc/yum.repos.d/

cd /app/web_app

bower install && bower-move
npm install

chown -R web-app:web-app /app/

#remove the existing service file (if it exists)
rm -f /usr/lib/systemd/system/material-dashboard.service

cp /app/infrastructure/config/material-dashboard.service /usr/lib/systemd/system
