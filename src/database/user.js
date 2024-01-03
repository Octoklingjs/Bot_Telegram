const dotenv = require("dotenv")
dotenv.config()

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.URIDB;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

module.exports.verificationUserAndGetData = async function(username){
    return new Promise(async (resolve, reject) => {
        try{

            if(!username || typeof username != "string") reject("Entrez un username correct");

            await client.connect();
            let db = client.db("Users");
            let collection = db.collection("Settings");
    
            const result = await collection.findOne({ username: username });
    
            if(result){
                resolve({isExist: true, data: result})
            }else{
                resolve({isExist: false, data: {}})
            }
    
        } finally {
          await client.close();
        }
    })
}