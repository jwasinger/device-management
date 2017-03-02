#! /bin/bash

yum update -y
yum install -y ruby
yum install -y wget
cd /tmp/
wget https://aws-codedeploy-us-west-2.s3.amazonaws.com/latest/install
chmod +x /tmp/install
/tmp/install auto
