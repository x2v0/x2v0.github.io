#!/bin/bash
git add .
echo "Insert your commit message >"
read -r commit
git commit -m "$commit"
echo "Pull, Push, or Switch Branch >"
read -r answer
if [[ $answer == "pull" ]];
then
    git pull
    echo "Done with pulling, would you like to push your files (y/n)?"
    read -r pushing
    if [[ $pushing == "y" ]];
    then
        git push
    else
        exit;
    fi
elif [[ $answer == "push" ]];
then
    git push
elif [[ $answer == "switch branch" ]];
then
    echo "Enter the new branch name >"
    read -r branch
    git checkout "$branch"
fi
