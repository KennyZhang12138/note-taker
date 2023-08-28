const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 3001;
const express = require("express");
const app = express();

const notes = require("./db/db.json");

//middleware to use
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/notes.html"));
});

app.get("/api/notes", (req, res) => {
  fs.readFile(path.join(__dirname, "./db/db.json"), "utf8", (error, notes) => {
    if (error) {
      console.log(error);
    }
    res.json(JSON.parse(notes));
  });
});

//update new user input note to db
app.post("/api/notes", (req, res) => {
  //retrive notes from db.json
  fs.readFile(path.join(__dirname, "./db/db.json"), "utf8", (error, data) => {
    if (error) {
      return console.log(error);
    }
    let notes = JSON.parse(data);
    //assign unique id to each new note depending on last id.
    //if no items in notes array, assign id to 1
    if (notes.length > 0) {
      let lastId = notes[notes.length - 1].id;
      var id = parseInt(lastId) + 1;
    } else {
      var id = 1;
    }
    let newNote = {
      title: req.body.title,
      text: req.body.text,
      id: id,
    };
    //add new note to notes array
    var newNotesDB = notes.concat(newNote);
    //write new array to db.json file
    fs.writeFile(
      path.join(__dirname, "./db/db.json"),
      JSON.stringify(newNotesDB),
      (error, data) => {
        if (error) {
          return error;
        }
        console.log(newNotesDB);
        res.json(newNotesDB);
      }
    );
  });
});

//delete method
app.delete("/api/notes/:id", (req, res) => {
  let deleteId = JSON.parse(req.params.id);
  console.log("ID to be deleted: ", deleteId);
  fs.readFile(path.join(__dirname, "./db/db.json"), "utf8", (error, data) => {
    if (error) {
      return console.log(error);
    }
    let notes = JSON.parse(data);
    for (var i = 0; i < notes.length; i++) {
      if (deleteId == notes[i].id) {
        notes.splice(i, 1);
        //rewrite updated notes array to db file
        fs.writeFile(
          path.join(__dirname, "./db/db.json"),
          JSON.stringify(notes),
          (error, data) => {
            if (error) {
              return error;
            }
            console.log(notes);
            res.json(notes);
          }
        );
      }
    }
  });
});

//if user access an invalid url, lead back to home page
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}!`);
});
