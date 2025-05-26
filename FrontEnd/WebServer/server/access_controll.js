

function getUser(req, res,next){


let response ={};
response.user_id = req.session.user_id
response.user_fio = "Unknown person"
response.user_fio_short = "UNP"

res.json(response)
}

function captureGroups(req, res,next){
  //Эта функция ловит из запроса перечень групп и записывает в сессии

const groups = req.connection.userGroups

if(groups){
  const groups_mod = groups.map(x => {return x.split('\\')[1]});
  req.session.groups = groups_mod;
}

//console.log("groups captured",groups)
//console.log("req.connection",req.connection.userGroups,req.connection.user)
//console.log("req.socket",req.socket.userGroups,req.socket.user)
//console.log("headers",req.headers)

next()
};

module.exports = {
getUser:getUser,
captureGroups:captureGroups
}
