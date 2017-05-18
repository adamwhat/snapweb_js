#!/bin/bash

# Arg 1 (Optional) Deploy $Branch to heroku

LocalBranch=${1:-master}

pushd "`git rev-parse --show-toplevel`"
echo "git subtree push --prefix final heroku $LocalBranch:master -f"
popd
