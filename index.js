var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require("express-session");
const app = express();
const nodemailer = require("nodemailer");

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    //Matches the content type header
    extended: true,
  })
);
app.use(
  session({
    secret: "add a random secret string here",
    resave: false,
    saveUninitialized: true,
  })
);

app.post("/logout", (req, res, next) => {
  req.session.user = null;
  return res.send("DONE");
});

const mongoAtlasUri =
  "mongodb+srv://xenon_stack_amish:Amish%401234@cluster0.hzjn9ua.mongodb.net/MyDB?retryWrites=true&w=majority";
// try {
//   // Connect to the MongoDB cluster
//   mongoose.connect(
//     mongoAtlasUri,
//     { useNewUrlParser: true, useUnifiedTopology: true },
//     () => console.log(" Mongoose is connected")
//   );
// } catch (e) {
//   console.log("could not connect");
// }

mongoose
  .connect(mongoAtlasUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to the database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. n${err}`);
  });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// app.use((req, res, next) => {
//   console.log(req.session.user);
//   if (req.session.user) {
//     return res.redirect("contact.html?user=" + req.session.user);
//   } else {
//     // return res.redirect("index.html");
//     next();
//   }
// });

const User = mongoose.model("users", UserSchema);

app.post("/register", async (req, res, next) => {
  // here, you can get the username and password from req.body in the actual site. Here, we will hardcode the values.
  const username = req.body.name;
  const password = req.body.password;
  // const hashedPw = await bcrypt.hash(password, 12);
  const user = await User.create({ name: username, password });
  await user.save();
  // return res.send(user);
  return res.redirect("index.html");
});

app.post("/login", async (req, res) => {
  // again here, you would get the username and password from a form in the actual site. Here, we hardcode the values again.
  console.log("data", req.body);

  const username = req.body.name;
  const password = req.body.password;
  const user = await User.findOne({ name: username, password: password });
  console.log("User", user);
  // const matchstatus = await bcrypt.compare(password, user.hashedPw);
  if (user) {
    req.session.user = user.name;
    console.log("logged in!");
    return res.redirect("contact.html?user=" + req.session.user);
  } else {
    console.log("not logged in!");
    return res.send("Wrong ID or Password");
  }
});

app.post("/contact", (req, res) => {
  if (req.session.user) {
    const mailData = {
      from: "amish.90-cse-19@mietjammu.in", // sender address
      to: req.body.email, // list of receivers
      subject: req.body.subject,
      text: req.body.name,
      html: `<b>Hey ${req.body.name} </b>
                <br>
                <br>
               <br> You need Services: ${req.body.message}<br/>
               <b>Our representative will get in touch with you shortly</b
               <br/><br/><br/>`,
    };

    const transporter = nodemailer.createTransport({
      port: 465, // true for 465, false for other ports
      host: "smtp.gmail.com",
      auth: {
        user: "amish.90-cse-19@mietjammu.in",
        pass: "amish@1234",
      },
      secure: true,
    });

    transporter.sendMail(mailData, function (err, info) {
      if (err) res.send(err);
      else res.send("Email Sent we will get back to you shortly");
    });
  } else {
    res.redirect("index.html");
  }
});

var db = mongoose.connection;

app
  .get("/", (req, res) => {
    res.set({
      "Allow-access-Allow-Origin": "*",
    });
    res.redirect("index.html");
  })
  .listen(3000);

console.log("Listening on PORT 3000");

//demo comment