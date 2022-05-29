// requireing package
const express = require("express");
const showdown = require('showdown');
require('dotenv').config();
const { GraphQLClient, gql } = require('graphql-request');

const app = express();

app.set('view engine', 'ejs');

converter = new showdown.Converter();
//port
const port = 8080;

//github username, token, endpoint
const githubData = {
    token: process.env.GITHUB_API,
    username: "debasishbsws",
    endpoint: "https://api.github.com/graphql"
};
// graphQLCline
const graphQLCline = new GraphQLClient(githubData.endpoint, {
    headers: {
        authorization: `Bearer ${githubData['token']}`
    },
});
// graphQL query for pinned repo
const pinnedRepoQuery = gql`{
    user(login: "${githubData['username']}") {
        url
        avatarUrl
        pinnedItems(last: 6) {
            edges {
                node {
        	        ... on RepositoryInfo{
                        name
                        url
                        updatedAt
                        description
                    }
                }
            }
        }
    }
}`;

// use "public" as a static folder
app.use(express.static("public"));

// global scope var 
// let pinnedRepo;

// requests ----------------------------------------------------------------

app.get("/", async (req, res) => {
    //geting github info
    const githubInfo = await graphQLCline.request(pinnedRepoQuery);

    //render with info
    res.render("index", {
        page: "",
        pinnedRepos: githubInfo.user.pinnedItems.edges,
        avatarUrl: githubInfo.user.avatarUrl
    });
});

app.get("/projects/:projectName", async (req, res) => {

    //graphQl query for repo info
    const repoInfoQuery = gql`{
repository(name: "${req.params.projectName}", owner: "${githubData['username']}") {
    url
    updatedAt
    upCase: object(expression: "HEAD:README.md") {
      ... on Blob {
        text
      }
    }
  }
}`
    const repoInfo = await graphQLCline.request(repoInfoQuery);
    let readmeHtml;
    if (typeof repoInfo.repository.upCase.text == 'undefined' || repoInfo.repository.upCase.text == null) {
        readmeHtml = "<h1>README.md dosen't exist.</h1>"
    }
    else {
        readmeHtml = converter.makeHtml(repoInfo.repository.upCase.text)
    }

    res.render("project", {
        page: "/",
        url: repoInfo.repository.url,
        text: readmeHtml,
    });
});

// app.get("/a", async (req, res) => {
//     const repoInfo = await graphQLCline.request(q);
//     res.send(repoInfo);
// });

//end------------------------------------------------------------------------


app.listen(port, () => {
    console.log("[Server]: Server is runing on http://localhost:" + port + '/');
});
