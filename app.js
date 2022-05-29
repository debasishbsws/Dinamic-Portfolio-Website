// requireing package
const express = require("express");

const { GraphQLClient, gql } = require('graphql-request');

const app = express();

app.set('view engine', 'ejs');

//port
const port = 8080;

//github username, token, endpoint
const githubData = {
    token: "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",
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
        pinnedRepos: githubInfo.user.pinnedItems.edges,
        avatarUrl: githubInfo.user.avatarUrl
    });
});

app.get("/prepo", async (req, res) => {
    // console.log();
    const pinnedRepo = await graphQLCline.request(pinnedRepoQuery);
    console.log(pinnedRepo);
    res.send(pinnedRepo);
    // res.render("blogHome", { pinnedRepos: pinnedRepo.user });
});

app.get("/a", async (req, res) => {
    const repo = await graphQLCline.request(q);
    res.send(repo);
});

const q = gql`{
repository(name: "Travel-Agency-Website", owner: "debasishbsws") {
    upCase: object(expression: "HEAD:README.md") {
      ... on Blob {
        text
      }
    }
  }
}`
//end------------------------------------------------------------------------
// const getPinnedRepo = () => {
//     //pinned repo query
//     const pinnedRepoQuery = gql`{
//     user(login: "${githubData['username']}") {
//         name
//         pinnedItems(last: 6) {
//             edges {
//                 node {
//         	        ... on RepositoryInfo{
//                         name
//                         url
//                         updatedAt
//                         description
//                     }
//                 }
//             }
//         }
//     }
// }`;
//     pinnedRepo = graphQLCline.request(pinnedRepoQuery);
// }

app.listen(port, () => {
    console.log("[Server]: Server is runing on http://localhost:" + port + '/');
});




// resourcePath
// mirrorUrl
// homepageUrl

// {
//     repository(name: "Travel-Agency-Website", owner: "debasishbsws") {
//         id
//     }
// }