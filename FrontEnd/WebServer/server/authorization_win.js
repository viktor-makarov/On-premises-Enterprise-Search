const nodeSSPI = require('node-sspi');
var other_functions = require('./other_functions')
const mongo = require('./mongo.js');

module.exports = {

nodeSSPIAuth:function (req, res,next){

    let timestamp = Date.now()
    let sessionUser = req.session.user_id
    if (sessionUser){ //если в cookie содержится пользователь, значит пользователь уже ранее проходил авторизацию. Можно не повторять

      return next()
    }
    else {
      //Сюда идем, если в cookie не обнаружилось информаии о пользователе
    var auth = req.headers['authorization']; //достаем из запроса заголовок authorization

    var nodeSSPIObj = new nodeSSPI({
        retrieveGroups: true,
        sspiPackagesUsed: ['Negotiate','NTLM'],
    });

        nodeSSPIObj.authenticate(req, res, function(err){ //эта функция обрабатывает тикеты от kerberos и в случае успеха авторизовывает пользователя и получает его доменное имя

          if(err){
            console.log("Error on auth",err)
            return res.end("Error on auth " + err);
          }

          let domain_and_user = req.connection.user
          if (!domain_and_user){
            return res.end(' ');
          }



          //Далее нам нужно записать полученное доменное имя в запрос, чтобы закинуть его в cookie пользователя
          domain_and_user = domain_and_user.toLowerCase().split("\\")[1];
          var auth = req.headers['authorization'];
          console.log(auth)
          mongo.session_log_to_mongo(domain_and_user,timestamp)
          console.log("Auth success (windows)",domain_and_user)
          const groups = req.connection.userGroups

          if(groups){
            const groups_mod = groups.map(x => {return x.split('\\')[1]});
          //  console.log(groups_mod)
            req.session.groups = groups_mod;
          }
          req.session.timestamp = timestamp
          req.session.user_id = domain_and_user
          req.session.cookie.maxAge = other_functions.millisecondsToMidnight() //ограничиваем время жизни cookie до полуночи
          return next()
          });
        };
      }
    }
