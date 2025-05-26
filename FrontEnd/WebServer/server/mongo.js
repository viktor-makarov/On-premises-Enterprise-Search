const mongoose = require('mongoose');
const Schema = mongoose.Schema

const connectionString_self_mongo = mongo_config.url
let webapps_db = process.env.MONGO_DB || "srch_pre_prod"

async function Connect_to_mongo(connectionString,db,callback) {

    const connection = await mongoose.createConnection(connectionString + "/" + db + "?authSource=admin", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
    return callback(connection)
}

async function SessionLogToMongo (user,timestamp) {

  const collection = 'AuthLog'

  const sheem = new Schema({
  	username: {
  		type: String,
  		required: true
  	},
  	sessiontimestamp: {
  		type: Number,
  		index: true,
  		unique: true,
  		required: true
  	},
  	createdAt_UTF: {
  		type: Date,
  		default: Date.now,
  	}
  },
  { collection : collection });



  return await Connect_to_mongo(connectionString_self_mongo,webapps_db, connection =>{
  const model = connection.model(collection, sheem)

  model.create({username: user,sessiontimestamp: timestamp},
  function(err, doc){
    //connection.disconnect();
    if(err) {
      console.log("SessionLogToMongo","Insert to mongo failed with error:",err)
    };
  })
  });
};


async function RequestLogToMongo(req, res,next){

const collection = 'RequestLog'
  const mongoose = require('mongoose');

const sheem = new Schema({

	before_select: {
		type: String
	},
	selected: {
		type: String
	},
  cause: {
    type: String
  },
	createdAt_UTF: {
		type: Date,
		default: Date.now
	}
}
 );

 return await Connect_to_mongo(connectionString_self_mongo,webapps_db, connection =>{
 const model = connection.model(collection, sheem)

console.log(req.body)

 model.create({before_select: req.body.data.before_select,selected: req.body.data.selected,cause:req.body.data.cause},
 function(err, doc){
   //connection.disconnect();
   if(err) {
     res.send({result:"Failed to log error"})
     console.log("RequestLogToMongo","Insert to mongo failed with error:",err)
   };
 })
 res.send({result:"Error logged to database"})
 });
};




module.exports = {
session_log_to_mongo:SessionLogToMongo,
request_log_to_mongo:RequestLogToMongo,
queryvalue:RequestLogToMongo
}
