# vvec-org/add-project
This action adds standard set of labels to a repository

## inputs
This action requires the following user inputs:

input | description
---- | ----
repo-id | the (node) ID of the repository 
repo-name | name of the repository
repo-owner | owner of the repository
repo-token | authorization token to access the repository

## outputs
none

## dependencies
This action uses:
- the GitHub GraphQL API
- the workflow run context.
- the @action/core package.

*NOTE* This is action is in development and is subject to change

