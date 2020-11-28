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


const baseProjects = [
  {
    "name" : "1: Design Overview",
    "body" : "Collection of *ALL* Design Issues in a Project"
  },
  {
    "name" : "2: Functional Design",
    "body" : "Collection of Functional Design Issues"
  },
  {
    "name" : "3: Mechanical Design",
    "body" : "Collection of Mechanical Design Issues"
  },
  {
    "name" : "3: Hardware Design",
    "body" : "Collection of Hardware Design Issues"
  },
  {
    "name" : "3: Firmware Design",
    "body" : "Collection of Firmware Design Issues"
  },
  {
    "name" : "3: Software Design",
    "body" : "Collection of Software Design Issues"
  }
];

const createProject = `mutation createProject($repo_id: [ID!], $owner_id: ID!, $project_name: String!, $project_body: String) {
  createProject( input:{repositoryIds: $repo_id, ownerId: $owner_id, name: $project_name,  body: $project_body, }) {
      project{
        id
        body
        name
        owner{
          id
        }
        columns(first: 100){
          totalCount
          nodes{
            id
            name
          }
        }
      }
    }
  }
`

async function addRepoProject(repo, projectName, projectBody ) {
  // @todo: add null parameter rejection for required parameters
  projectBody = projectBody || null;
  
  const queryVariables = Object.assign({},{
      repo_owner: repo.owner, 
      repo_name: repo.name,
      headers: {
          authorization: `Bearer ` + repo.token,
          accept: `application/vnd.github.bane-preview+json`,
          },   
      },
      { repo_id: [repo.id], owner_id: repo.id, project_name: projectName, project_body: projectBody }
  );

  try {
      // console.log("vars: ", JSON.stringify(queryVariables));

      const response = await graphql(
        createProject,
         queryVariables 
      );
      return response.createProject.project;
  } catch (err) {
      console.log("failed", err.request)
      console.log(err.message)
      return null;
  }
}

const createColumn = `mutation addProjectColumn($project_id: ID!, $column_name: String!) {
  addProjectColumn(input:{projectId: $project_id, name: $column_name }) {
    project{
      id
      name
      columns(first:100) {
        nodes{
          id
          name
        }
      }
    }  
  }
}
`

async function addProjectColumn(repo, projectId, columnName ) {
  // @todo: add null parameter rejection for required parameters
  
  const queryVariables = Object.assign({},{
      repo_owner: repo.owner, 
      repo_name: repo.name,
      headers: {
          authorization: `Bearer ` + repo.token,
          accept: `application/vnd.github.bane-preview+json`,
          },   
      },
      { project_id: projectId, column_name: columnName }
  );

  try {
      // console.log("vars: ", JSON.stringify(queryVariables));

      const response = await graphql(
        createColumn,
        queryVariables 
      );
      return response.addProjectColumn.project;
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

    for(const project of baseProjects) {
      const resultProject = await addRepoProject(repoConfig, project.name, project.body);
      // console.log("project result: ", JSON.stringify(resultProject));
      var projID = resultProject.id;
      // console.log(projID);
      for(const column of columns) {
          const resultColumn = await addProjectColumn(repoConfig, resultProject.id, column.name)
          console.log("project result: ", JSON.stringify(resultColumn));               
      }
    }
  } catch (err) {
      console.log("failed", err.request)
      console.log(err.message)
  }
}

action();