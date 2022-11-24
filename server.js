const express = require("express");
const morgan = require("morgan");
require('dotenv').config()
const app = express();  //Create new instance
const PORT = process.env.PORT || 5000; //Declare the port number
const fs = require('fs')
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); //allows us to access request body as req.body
app.use(morgan("dev"));  //enable incoming request logging in dev mode

//Define the endpoint
app.get("/", (req, res) => {  
  return res.send({
    status: "Healthy",
  });
});

//verify the payment
app.get("/verify",(req,res)=>{
    const {account,txn}=req.query;
    if(!account||!txn)
    res.json({amount:0});

    const transactions = JSON.parse(
      fs.readFileSync(`${__dirname}/db.json`)
    );

    const found = transactions.find(t => t.txnId === txn);
    if(found)
    res.status(200).json({amount:found.amount})
    res.status(404).json({amount:0})
})

//create new entry of payment
app.post("/newEntry",(req,res)=>{

    const {txn,account,amount}=req.body
    if(!txn||!account||!amount)
    res.sendStatus(400);
    
    const transactions = JSON.parse(
      fs.readFileSync(`db.json`)
    );

    const newTxn = Object.assign({ txnId: txn,account,amount });

    transactions.push(newTxn);
  
    fs.writeFile(
      `${__dirname}/db.json`,
      JSON.stringify(transactions),
      err => {
        res.status(201).json({
          status: 'success',
          data: {
            transaction: newTxn
          }
        });
    })
    
})
app.listen(PORT, () => {
  console.log("Server started listening on port : ", PORT);
});