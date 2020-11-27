const core = require('@actions/core');
const {graphql} = require('@octokit/graphql');

const addLabel = `mutation addLabel($repo_id: ID!, $label_name: String!, $label_description:String!, $label_color:String!) {
  createLabel(input:{repositoryId: $repo_id, name: $label_name, description: $label_description, color: $ label_color}) {
    label {
      repository {
        name
      }
      id
      name
      description
      color
    }
  }
}
`

async function addRepoLabel(repo, label) {
  const queryVariables = Object.assign({},{
      repo_owner: repo.owner, 
      repo_name: repo.name,
      headers: {
          authorization: `Bearer ` + repo.token,
          accept: `application/vnd.github.bane-preview+json`,
          },   
      },
      { repo_id: repo.id, label_name: label.name, label_description: label.description, label_color: label.color }
  );

  try {
      console.log("vars: ", JSON.stringify(queryVariables));

      const response = await graphql(
        addLabel,
        queryVariables 
      );
      return response.createLabel.label;
  } catch (err) {
      console.log("failed", err.request)
      console.log(err.message)
      return null;
  }
}

async function action(){
  const labels = [ ...githubUtils.motusDefault.stages,
      ...githubUtils.motusDefault.needLabels,
      ...githubUtils.motusDefault.typeLabels,
      ...githubUtils.motusDefault.statusLabels,
  ];

  var repoConfig = {
    id: null,
    name: 'empty',
    owner: 'you',
    token: null
  };

  try {
    repoConfig.id = core.getInput('repo-id', {required: true});
    repoConfig.name = core.getInput('repo-name', {required: true});
    repoConfig.owner = core.getInput('repo-owner', {required: true});
    repoConfig.token = core.getInput('repo-token', {required: true});
    console.log("repo:\n" + JSON.stringify(repoConfig));

    console.log("labels:\n" + JSON.stringify(labels));
    var result = null;
    for(const label of labels) {
        result = await addRepoLabel(repoConfig, label);
    }
    console.log("final result:\n", JSON.stringify(result));
  } catch (err) {
      console.log("failed", err.request)
      console.log(err.message)
  }
}

action();