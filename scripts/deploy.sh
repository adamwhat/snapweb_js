#!/bin/bash

# Arg 1 (Optional) Deploy $Branch to heroku

LocalBranch=${1:-master}

pushd "`git rev-parse --show-toplevel`"
git push heroku `git subtree split --prefix final $LocalBranch`:master --force
popd
