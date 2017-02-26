#! /bin/bash

cur_dir=$(dirname "$0")
echo $(pwd) &> build-output.txt

$cur_dir/install_app.sh &> build-output.txt
