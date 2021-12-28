const express = require("express");
const app = express();
const bcrypt = require("bcrypt");

// this allows our application to accept JSON
app.use(express.json());

// for testing purposes we will store users in an array, but usually you wanna do it in a database
// since everytime you refresh the server, it would empty it out again
const users = [];

app.get("/", (req, res) => {
  res.send("Server");
});

app.get("/users", (req, res) => {
  res.send(users);
});

// this is for creating users
// we will create teh user, hashing the password, saving it into the users array
// bcrypt is an async library
app.post("/users", async (req, res) => {
  try {
    // the bigger the number, the longer it is going to make a hash
    // 10 can generate a few hashes per second, but 20-30 is going to take a few days
    // leaving it blank would be the default value of 10
    const salt = await bcrypt.genSalt();

    // takes two parameters, (password, salt)
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // another method of generating a hashedPassword is:
    // as 10 is the default number of rounds and it would generate the salt for us
    // const hashedPassword = await bcrypt.hash(req.body.password, 10);

    console.log("salt:", salt);
    console.log("hashedPassword:", hashedPassword);

    // bcrypt saves the salt inside the hashed password
    const user = { name: req.body.name, password: hashedPassword };

    users.push(user);
    res.status(201).send();
  } catch {
    res.status(500).send();
  }
});

// bcrypt is an async library
app.post('/users/login', async (req, res) => {
    // checks if the request's name is same as the user found in our array/db
    // if found, user becomes the specific user that we are looking for
    // in this case, user.name should be unique 
    const user = users.find(user => user.name === req.body.name)
    if (user === null) {
        return res.status(400).send("Cannot Find User")
    }

    try {
        // pass in the (given password, hashed password)
        // compare the two password
        // gets the Salt out of the user.password 
        // then hash the req.body.password to make sure they both match
        // use bcrypt.compare() to prevent timing attacks.
        if (await bcrypt.compare(req.body.password, user.password)) {
            // if it is correct, the user is now logged in
            res.send("Success!")
        } else {
            res.send("Not Allowed")
        }
    } catch {
        res.status(500).send();
    }
})

app.listen(8000);
