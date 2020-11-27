const core = require('@actions/core');
const {graphql} = require('@octokit/graphql');


const needLabels = [
  {
    "color": "ff6767",
    "description": "Issue is critical to design scope",
    "name": "1: Critical",
  },       
  {
    "color": "ffbf7f",
    "description": "Issue is of high value to design scope",
    "name": "1: High",
  },       
  {
    "color": "fcfc7f",
    "description": "Issue is of low value to design scope",
    "name": "1: Low",
  },       
  {
    "color": "fff0bf",
    "description": "Issue is of no value to design scope",
    "name": "1: None",
  },       
];

const statusLabels = [
  {
    "color": "cfcfcf",
    "description": "new issue for triage",
    "name": "4: New",
  },
  {
    "color": "cfcfcf",
    "description": "re-opened issue for triage",
    "name": "4: Reopened",
  },
  {
    "color": "7fbf7f",
    "description": "issue ready for, or being worked on",
    "name": "4: In Progress",
  },
  {
    "color": "f75f5f",
    "description": "issue is blocked, waiting on EPL action",
    "name": "4: Blocked",
  },
  {
    "color": "f7bf7f",
    "description": "issue is fixed, EPL action required",
    "name": "4: Fixed",
  },
  {
    "color": "5f9ff7",
    "description": "issue is resolved",
    "name": "4: Resolved",
  },
  {
    "color": "5f9ff7",
    "description": "issue is a duplicate",
    "name": "4: Duplicate",
  },
  {
    "color": "5f9ff7",
    "description": "issue is cannot be reporduced",
    "name": "4: Can't Reproduce",
  },
  {
    "color": "5f9ff7",
    "description": "issue is not going to be addressed",
    "name": "4: Won't Fix",
  },
];

  const typeLabels = [
    {
      "color": "1d76db",
      "description": "Issue addresses documentation of behaviour or functionality",
      "name": "2: Document",
    },       
  {
    "color": "1ddb76",
    "description": "Issue addresses intended behaviour or functionality",
    "name": "2: Feature",
  },       
  {
    "color": "db1d3a",
    "description": "Issue addresses unintended behaviour or functionality",
    "name": "2: Bugs",
  },       
];

const stages = [
  {
    "color": "5f5f5f",
    "description": "This issue is new and waiting for triage",
    "name": "0: NEW",
  },      
  {
    "color": "1f7f5f",
    "description": "This issue is being investigated",
    "name": "3: INVESTIGATION",
  },
  {
    "color": "5f5f9f",
    "description": "This issue is being implmemented",
    "name": "3: IMPLEMENTATION",
  },           
  {
    "color": "1f7f9f",
    "description": "This issue is being tested",
    "name": "3: TESTING",
  },
  {
    "color": "3f5fbf",
    "description": "This issue is can be released",
    "name": "3: RELEASE",
  },       
];

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
  const labels = [ ...stages,
      ...needLabels,
      ...typeLabels,
      ...statusLabels,
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