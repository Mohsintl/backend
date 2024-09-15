import express from "express";
import "./db/config.js";
import User from "./db/User.js";
import cors from "cors";
import Jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({})


const jwtKey = 'e-com';



const app = express();
app.use(express.json());
app.use(cors());

import Product from './db/Product.js';


app.post("/register", async (req, resp) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  Jwt.sign({ result }, jwtKey, { expiresIn: '2h' }, (err, token) => {
    if (err) {
      resp.send({ result: "No user found " });
    } else {
      resp.send({ result, auth: token });
    }
  })
});

app.post("/login", async (req, resp) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({ user }, jwtKey, { expiresIn: '2h' }, (err, token) => {
        if (err) {
          resp.send({ result: "No user found " })

        }
        resp.send({ user, auth: token })

      })
    } else {
      resp.send({ result: "No user found " })
    }
  } else {
    resp.send({ result: 'enter complete info' })
  }
});

app.post('/add-product', verifyToken, async (req, resp) => {
  let product = new Product(req.body)
  let result = await product.save();
  resp.send(result)
})

app.get('/products', verifyToken, async (req, resp) => {
  let products = await Product.find();
  if (products.length > 0) {
    resp.send(products)
  } else {
    resp.send({ error: "no product found " })
  }
})

app.delete('/product/:id', verifyToken, async (req, resp) => {
  const result = await Product.deleteOne({ _id: req.params.id });
  resp.send(result);
})

app.get('/product/:id', verifyToken, async (req, resp) => {
  const result = await Product.findOne({ _id: req.params.id });
  if (result) {

    resp.send(result);
  } else {
    resp.send({ result: "NOT FOUND" })
  }

})

app.put('/product/:id', verifyToken, async (req, resp) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body
    }
  )
  resp.send(result);
})

app.get('/search/:key', verifyToken, async (req, resp) => {
  let result = await Product.find({
    "$or": [
      { name: { $regex: req.params.key } },
      { company: { $regex: req.params.key } }
    ]
  })
  resp.send(result);

})

function verifyToken(req, resp, next) {
  let token = req.headers['authoziation']
  if (token) {
    token = token.split(' ')[1];
    console.warn(token);
    Jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        resp.status(401).send({ result: 'provide valid token ' })
      } else {
        next();
      }
    })

  } else {
    resp.status(403).send({ result: 'please add token with header ' })
  }

}


app.listen(5000);
