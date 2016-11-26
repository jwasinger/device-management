#! /bin/bash
cd /ec2-user/web_app

yum install -y nodejs-0.10.46-1.el6 npm-1.3.6-5.el6 git.x86_64-2.7.4-1.47.amzn1
bower install --allow-root
npm install 
