const express = require("express");
require("./db/config");
const User = require("./db/User");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const Product = require('./db/Product')

app.post("/register", async (req, resp) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password
  resp.send(result);
  
});

app.post("/login", async (req, resp) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    user ? resp.send(user) : resp.send({ result: "No user found " });
  } else {
    resp.send({result:'enter complete info'})
  }
});

app.post('/add-product',async (req,resp) => {
 let product = new Product(req.body) 
 let result = await product.save();
 resp.send(result)  
})

app.listen(5000);
