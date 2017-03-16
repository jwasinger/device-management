#! /bin/bash

yum update -y
yum install -y epel-release
yum install -y git-1.7.1 wget-1.12 vim screen-4.0.3

#install ruby 2.1.0
gpg2 --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 &&
curl -L get.rvm.io | bash -s stable && 
source /etc/profile.d/rvm.sh &&
rvm reload &&
rvm install 2.1.0

# codedeploy needs ruby to be installed under /usr/bin
ln -s /usr/local/rvm/rubies/ruby-2.1.0/bin/ruby /usr/bin
 
# set up the CodeDeploy agent
cd /tmp/
wget https://aws-codedeploy-us-west-2.s3.amazonaws.com/latest/install
chmod +x /tmp/install
/tmp/install auto

# install NodeJS
wget http://nodejs.org/dist/v0.10.30/node-v0.10.30-linux-x64.tar.gz -P /tmp/
tar --strip-components 1 -xzvf node-v0.10.30-linux-x64.tar.gz -C /usr/

#open port 80 for tcp traffic

#talk why disabling iptables is not the end of the world here (the security group is applied at the NIC level and therefor, is approximately equivalent to a host-level firewall)
service iptables stop

# copy configuration to disable SELinux

# set up nginx with proxy from port 3000 to port 80
yum install -y nginx-1.10.2
service nginx start

#/bin/cp /tmp/config/nginx/nginx.conf /etc/nginx/

# Set up the user and directory for the NodeJS application
mkdir -p /app
useradd -d /app web-app
chown web-app:web-app /app

npm install -g bower bower-move
