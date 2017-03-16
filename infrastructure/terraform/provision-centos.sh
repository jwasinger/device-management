#! /bin/bash

yum update -y
yum install -y git
yum install -y epel-release
yum install -y ruby
yum install -y wget
yum install -y vim
yum install -y screen

#disable SELinux
setenforce 0

# set up the CodeDeploy agent
cd /tmp/
wget https://aws-codedeploy-us-west-2.s3.amazonaws.com/latest/install
chmod +x /tmp/install
/tmp/install auto

# install NodeJS
wget http://nodejs.org/dist/v0.10.30/node-v0.10.30-linux-x64.tar.gz -P /tmp/
tar --strip-components 1 -xzvf node-v0.10.30-linux-x64.tar.gz -C /usr/

#install Bower and bower-move
npm install -g bower bower-move

#install nginx
yum install -y nginx

#configure nginx as a local reverse proxy from port 3000 to port 80
/bin/cp /tmp/config/nginx/nginx.conf /etc/nginx/

# set nginx to start on boot
systemctl enable nginx
systemctl start nginx

# Set up the user and directory for the NodeJS application
mkdir -p /app
useradd -d /app web-app
chown web-app:web-app /app
