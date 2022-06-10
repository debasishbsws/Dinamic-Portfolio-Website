// requireing package
const express = require("express");
const showdown = require("showdown");
require("dotenv").config();
const { GraphQLClient, gql } = require("graphql-request");

const app = express();
app.set("view engine", "ejs");
converter = new showdown.Converter();
// use "public" as a static folder
app.use(express.static("public"));
//port
const port = 8080;

//github api ---------------------------------
const githubData = {
    token: process.env.GITHUB_API_TOKEN,
    username: process.env.USERNAME,
    endpoint: "https://api.github.com/graphql",
};
// graphQLCline GitHub
const graphQLClineGitHub = new GraphQLClient(githubData.endpoint, {
    headers: {
        authorization: `Bearer ${githubData["token"]}`,
    },
});
// graphQL query for pinned repo
const pinnedRepoQuery = gql`{
    user(login: "${githubData["username"]}") {
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

//hashnode api ---------------------------------
const hashnodeData = {
    token: process.env.HASHNODE_API_TOKEN,
    username: process.env.USERNAME,
    endpoint: "https://api.hashnode.com/",
};
// graphQLCline GitHub
const graphQLClineHashnode = new GraphQLClient(hashnodeData.endpoint, {
    headers: {
        authorization: `Bearer ${hashnodeData["token"]}`,
    },
});
// graphQL query for hashnode article
const hashnodeQuerry = gql`{
  user(username: "${hashnodeData["username"]}") {
    publication {
      posts(page: 0) {
        title
        brief
        slug
        dateAdded
      }
    }
  }
}`;

// requests ----------------------------------------------------------------

//home route get
app.get("/", async (req, res) => {
    //geting github info
    const githubInfo = await graphQLClineGitHub.request(pinnedRepoQuery);

    const info = await graphQLClineHashnode.request(hashnodeQuerry);

    //render with info
    res.render("index", {
        page: "",
        pinnedRepos: githubInfo.user.pinnedItems.edges,
        avatarUrl: githubInfo.user.avatarUrl,
        githubUrl: githubInfo.user.url,
        posts: info.user.publication.posts,
    });
});

//project route get
app.get("/projects/:projectName", async (req, res) => {
    //graphQl query for repo info
    const repoInfoQuery = gql`{
repository(name: "${req.params.projectName}", owner: "${githubData["username"]}") {
    url
    updatedAt
    upCase: object(expression: "HEAD:README.md") {
      ... on Blob {
        text
      }
    }
  }
}`;

    const repoInfo = await graphQLClineGitHub.request(repoInfoQuery);
    let readmeHtml;
    if (
        typeof repoInfo.repository.upCase.text === "undefined" ||
        repoInfo.repository.upCase.text === null
    ) {
        readmeHtml = "<h1>README.md dosen't exist.</h1>";
    } else {
        readmeHtml = converter.makeHtml(repoInfo.repository.upCase.text);
    }

    res.render("project", {
        page: "/",
        url: repoInfo.repository.url,
        text: readmeHtml,
    });
});

//end------------------------------------------------------------------------


app.listen(port, () => {
    console.log("[Server]: Server is runing on http://localhost:" + port + "/");
});
