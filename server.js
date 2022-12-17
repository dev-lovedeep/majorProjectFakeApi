const express = require("express");
const morgan = require("morgan");
require('dotenv').config()
const app = express();  //Create new instance
const PORT = process.env.PORT || 8000; //Declare the port number
const fs = require('fs')
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); //allows us to access request body as req.body
app.use(morgan("dev"));  //enable incoming request logging in dev mode

fs.writeFile(
  `${__dirname}/db.json`,`[]`,
  err => {
   if(err)
   console.log("unable to create empty db file")
   console.log("db file created")
})

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

    console.log("received:",txn,account)
    const transactions = JSON.parse(
      fs.readFileSync(`${__dirname}/db.json`)
    );

    const found = transactions.find(t => t.txnId ==txn && t.account==account);
    if(found)
    {
      console.log("found",found,found.amount)
      return res.status(200).json({amount:found.amount})
    }
    else 
    //making the response 200 to avoid any issue with oracle
    return res.status(200).json({amount:0})
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