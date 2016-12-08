#! /bin/bash

cur_dir=$(dirname "$0")

$cur_dir/install_app.sh &> build-output.txt
