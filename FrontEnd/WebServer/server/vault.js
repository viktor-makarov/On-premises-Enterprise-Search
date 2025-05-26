

const currentDT = new Date();
const currentDT_Str = currentDT.toISOString()

const connect_and_get_token = async () => {

  const vault = require("node-vault")({
    apiVersion: "v1",
    endpoint: global.app_config.SVAULT_ADDRESS,
    requestOptions: {
	//rejectUnauthorized: false
    strictSSL: false
  },

  });

  const roleId = global.app_config.SEARCH_SVAULT_ROLEID;
  const secretId = global.app_config.SEARCH_SVAULT_SECRETID;

  //создаем подключение к svault
  const result = await vault.approleLogin({
    role_id: roleId,
    secret_id: secretId,
  });

//Получаем из svault автоматически сгенерированный token и добавляем его в параметры подключения. Чтобы далее использовать при запросах
vault.token = result.auth.client_token;
return vault
};

//запрашиваем из vault сертификаты ssl
const get_certs =  async () =>{

//используем функцию подключения
const result = await connect_and_get_token()

//получаем данные и парсим их в 2 переменные
const data = await result.read(global.app_config.SECRETS.TLS_CERTS)

  const cert = data.data.cert_crt
  const key = data.data.cert_key

  let httpsOptions = {
      key: key,
      cert: cert
  }

return httpsOptions
};

async function get_secret(secret, callback) {
    const vaultServer = await connect_and_get_token()
    const res = await vaultServer.read(secret)
    return callback(res)
}

async function get_ad_config () {
  return await get_secret(global.app_config.SECRETS.AD, resp => {
        return { url: resp.data.url,
          m_url: resp.data.m_url,
                      baseDN: resp.data.baseDN,
                      username: resp.data.username,
                      password: resp.data.password}
    })
  }
async function get_mongo_config () {
  return await get_secret(global.app_config.SECRETS.MONGODB, resp => {
        return {
          login: resp.data.login,
          pass: resp.data.pass,
          url:resp.data.url
        }
    })
    }

async function get_elastic_config () {
  return await get_secret(global.app_config.SECRETS.ELASTIC, resp => {
        return {
          protocol:resp.data.protocol,
          login: resp.data.login,
          pass: resp.data.pass,
          address:resp.data.address,
          key: resp.data.key,
          cert: resp.data.cert,
          ca: resp.data.ca,
        }
    })
    }

get_mongo_config()
//вызываем функцию для получения конфига для монго. Она работает асинхронно, но она успеет отработать прежде, чем mongo понядобится
.then(result =>{
  global.mongo_config = result
  //console.log("get_mongo_config",global.mongo_config)
  console.log(currentDT_Str+" Config for MongoDB received from vault")
})
.catch(err=>{
  console.log(currentDT_Str+" Failed to get mongodb config from vault",err)
})

get_ad_config()
//вызываем функцию для получения конфига для ActiveDirectory. Она работает асинхронно, но она успеет отработать прежде, чем mongo понядобится
.then(result =>{
  global.ad_config = result
  //console.log("get_ad_config",global.ad_config)
  console.log(currentDT_Str+" Config for ActiveDirectory received from vault")
})
.catch(err=>{
  console.log(currentDT_Str+" Failed to get ActiveDirectory config from vault",err)
})


module.exports = {
get_certs:get_certs,
get_elastic_config:get_elastic_config
}
