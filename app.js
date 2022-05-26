// requireing package
const express = require("express");

const app = express();

app.set('view engine', 'ejs');

// use "public" as a static folder
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index", {});
})



app.listen(8080, () => {
    console.log("Server is runing on http://localhost:8080/");
});