var kerberos = require('kerberos').Kerberos;
var other_functions = require('./other_functions');
const mongo = require('./mongo.js');
var ActiveDirectory = require('activedirectory2')

function krb5_auth (req, res,next) {
	//Данная функция осуществляет авторизацию пользователя
	//Первым делом отправляется ответ 401 с заголовком Negotiate в надежде получить керберос токен
	//Затем полученный токен отправляем на проверку в KDC и если токен потверждается, то получаем имя пользователя
	//Закидываем имя пользователя в cookie сессии и на этом заканчиваем

	let timestamp = Date.now()

	let sessionUser = req.session.user_id

	if (sessionUser){ //если в cookie содержится пользователь, значит пользователь уже ранее проходил авторизацию. Можно не повторять

		return next()
	} else {

	var auth = req.headers['authorization']; //достаем из запроса заголовок authorization
	  if(auth) {
			//Если заголовок есть, то проверяем, упоминается ли в нем "Negotiate"
			if (auth.lastIndexOf('Negotiate ', 0) !== 0) {

				console.log('Malformed authentication header: '+auth)
				res.statusCode = 500;
				return res.end('Malformed authentication header');
			}

	    var token = auth.substring("Negotiate ".length); //из заголовка вырезаем сам токен
			//Инициализируем сервер на основании keytab
			//let domainName = process.env.APPURL.toLowerCase().split("//")[1]
			let domainName = req.hostname
			console.log("Host",domainName)
			kerberos.initializeServer("HTTP@"+domainName)
			.then((kbServer)=>{
				console.log("Kerberos server successfully initialized")
				console.log("Token",token)
		    kbServer.step(token) //отправляем токен на проверку в KDC
		    .then(serverResponse => {
		      //res.setHeader('WWW-Authenticate', 'Negotiate ' + kbServer.response);
		      if(kbServer.contextComplete && kbServer.username){
						//В случае успешной проверки получаем имя пользователя. Парсим его и добавляем в сессию

						let domain_and_user = kbServer.username.toLowerCase().split("@")[0];


						var ad = new ActiveDirectory(ad_config);

						let sAMAccountName = domain_and_user
						ad.getGroupMembershipForUser(sAMAccountName, function(err, groups) {
									if (err) {
										console.log('ERROR: ' +JSON.stringify(err));
										return res.end('ERROR: ' +JSON.stringify(err));
									}


										mongo.session_log_to_mongo(domain_and_user,timestamp)
										if(groups){
					            const groups_mod = groups.map(x => {return x.cn});
											groups_mod.push(domain_and_user)
					            console.log(groups_mod)
					            req.session.groups = groups_mod;
					          };
										req.session.timestamp = timestamp
										req.session.user_id = domain_and_user
										req.session.cookie.maxAge = other_functions.millisecondsToMidnight() //ограничиваем время жизни cookie до полуночи
										console.log("Auth success (linux)",domain_and_user)
						 				return next()
									})
		      } else {
		        res.statusCode = 500;
						console.log("Token verification suceessful but user not found. Context:",JSON.stringify(kbServer))
		        return res.end("Token verification suceessful but user not found. Context:"+JSON.stringify(kbServer));
		      }
		    })
		    .catch(err => {

		      res.statusCode = 500;
					console.log("Error on token verification",err.message,"Token",token)
		      return res.end("Error on token verification. " + err.message);

		    });
		})
		.catch((err) => {
			console.log("Kerberos server init failed",err)
			res.statusCode = 500;
			return res.end("Kerberos server init failed " + err);
		});

	  } else {
	    res.statusCode = 401;
	  //  res.setHeader('WWW-Authenticate', 'Negotiate', 'NTLM', 'Basic realm="scai_auth"');
			res.header('WWW-Authenticate', ['Negotiate']);

		//	res.set('WWW-Authenticate', 'NTLM')
		//	res.setHeader('WWW-Authenticate', 'Basic realm="scai_auth"');
	    return res.end(' ');
	  }
	}
}

module.exports = {
krb5_auth:krb5_auth
}
