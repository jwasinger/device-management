#! /bin/bash
cp infrastructure/config/epel.repo /etc/yum.repos.d/

yum install -y nodejs-0.10.46-1.el6 npm-1.3.6-5.el6 git-2.7.4-1.47.amzn1
bower install --allow-root web_app
npm install web_app
