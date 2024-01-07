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

client.connect();

module.exports.verificationUserAndGetData = async function(userID){
    return new Promise(async (resolve, reject) => {
        try{
            if(!userID || typeof userID != "number") return reject("Entrez un userID correct en format int");

            let db = client.db("Users");
            let collection = db.collection("Settings");
    
            const result = await collection.findOne({ userID: userID });
    
            if(result){
                await client.close();
                resolve( Object.assign({isExist: true}, result) )
            }else{
                await client.close();
                resolve({isExist: false})
            }
    
        }
        catch(err)
        {
            reject(err);
        }
    })
}

module.exports.addUserSettingsToDB = async function(userInfo){
    return new Promise(async (resolve, reject) => {
        try{
            if(!userInfo || typeof userInfo != "object") return reject("Entrez un userInfo correct en format array");

            let db = client.db("Users");
            let collection = db.collection("Settings");
    
            const result = await collection.insertOne({username: userInfo.username, lang: "en", userID: userInfo.id})
    
            if(result){
                await client.close();
                resolve({success: true, result: result})
            }else{
                await client.close();
                resolve({success: false, result: {}})
            }
    
        }
        catch(err)
        {
            reject(err);
        }
    })
}

module.exports.changeUserLang = async function(userInfo, newLanguage){
    return new Promise(async (resolve, reject) => {
        try{
            if(!userInfo || typeof userInfo != "object") return reject("Entrez un userInfo correct en format array");

            let db = client.db("Users");
            let collection = db.collection("Settings");
    
            const user = await collection.findOne({userID: userInfo.id})
    
            if(user){
                const result = await collection.updateOne(
                    { userID: userInfo.id},
                    { $set: { lang: newLanguage } }
                  );
                resolve({success: true, result: result})
            }else{
                await client.close();
                resolve({success: false, result: {}})
            }
    
        }
        catch(err)
        {
            reject(err);
        }
    })
}