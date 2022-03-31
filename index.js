const express = require('express')
const cors = require("cors");
const app = express()
app.use(express.json())
require('dotenv').config()
const port = process.env.PORT || 7000 ;
app.use(cors())
const fileUpload = require('express-fileupload');
app.use(fileUpload())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yydji.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run () {

           try{
              await client.connect()
              const database = client.db("XTool")
              const usersCollection = database.collection("users")
              const projectCollection = database.collection("projects")

              app.get('/users', async(req, res) => {
                const user =  usersCollection.find({})
                const result = await user.toArray();
                res.json(result)
              }) 

              app.get('/projects', async(req, res)=>{
                const projects = projectCollection.find({});
                const result = await projects.toArray();
                res.json(result)
              }) 

              

              app.post('/projects', async(req, res) =>{
                const project = req.body;
                const result = await projectCollection.insertOne(project);
                res.json(result)
              })


              app.post('/users', async(req, res) =>{
                const user = req.body;
                const result = await usersCollection.insertOne(user);
                res.json(result)
              })

              app.put('/users', async(req, res)=>{
                const user = req.body;
                const filter = {email : user.email}
                const options = { upsert : true}
                const updateDoc = {$set : user}
                const result = await usersCollection.updateOne(filter, updateDoc, options)
                res.json(result)
                
              })  

              app.put('/user/:email', async(req, res) =>{
                

                if(req.files){
                  const email =   req.params.email;
                  const filter = { email : email};
                  const options = {upsert: true};
                  const pic = req.files.img;
                  const picData = pic.data;
                  const encodedPic = picData.toString('base64')
                  const profilePhoto = Buffer.from(encodedPic, 'base64');
                  const updateDoc = {$set: {image:profilePhoto}}
                  const result = await usersCollection.updateOne(filter,updateDoc,options)
                  res.json(result)
                 

                }
                else if(req.body)
                {
                const email =   req.params.email;
                const filter = { email : email};
                const options = {upsert: true};
                const data = req.body;
                const updateDoc = {$set: data}
                const result = await usersCollection.updateOne(filter,updateDoc, options)
                res.json(result)
                }
                
              })

              app.get('/user/:email', async (req, res) => {
                const email = req.params.email;
                const filter = {email: email};
                const result = await usersCollection.findOne(filter);
                res.json(result)
              })
           }
           finally{
            //  await client.close()
           }
}

run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})