const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const currentDT = new Date();
const currentDT_Str = currentDT.toISOString()

//Читаем параметры из файла с параметрами
const configFileList = [path.join(__dirname, '..', 'config', 'config.yaml'),'/config/config.yaml']
let app_config ={};

for (let i = 0; i < configFileList.length; i++) {
  let path = configFileList[i]
  if (fs.existsSync(path)) {
    try {
        let fileContents = fs.readFileSync(path, 'utf8');
        app_config = yaml.load(fileContents);
        console.log(currentDT_Str+" General app config uploaded from "+path)
    } catch (e) {
        console.log(currentDT_Str+" Unable to upload general app config. ",e);
    }
    break;
  }
}

//console.log("app_config",app_config)

let ssl_certs ={};

const sslCertPath = [path.join(__dirname, '..', 'ssl', 'fullchain.crt'),'/etc/ssl/fullchain.crt']
for (let i = 0; i < sslCertPath.length; i++) {
  let path = sslCertPath[i]
  if (fs.existsSync(path)) {
    try {
        ssl_certs.cert = fs.readFileSync(path, 'utf8');
        console.log(currentDT_Str+" SSL cert uploaded from "+path)
    } catch (e) {
        console.log(currentDT_Str+" Unable to upload cert ssl. ",e);
    }
    break;
  }
}

const sslKeyPath = [path.join(__dirname, '..', 'ssl', 'cert.key'),'/etc/ssl/cert.key']
for (let i = 0; i < sslKeyPath.length; i++) {
  let path = sslKeyPath[i]
  if (fs.existsSync(path)) {
    try {
        ssl_certs.key = fs.readFileSync(path, 'utf8');
        console.log(currentDT_Str+" SSL key uploaded from "+path)
    } catch (e) {
        console.log(currentDT_Str+" Unable to upload key ssl. ",e);
    }
    break;
  }
}

let elastic_ssl_certs ={};

const sslElasticCertPath = [path.join(__dirname, '..', 'ssl', 'elastic_cert.crt'),'/etc/ssl/elastic_cert.crt']

for (let i = 0; i < sslElasticCertPath.length; i++) {
  let path = sslElasticCertPath[i]
  if (fs.existsSync(path)) {
    try {
        elastic_ssl_certs.cert = fs.readFileSync(path, 'utf8');
        console.log(currentDT_Str+" SSL elastic cert uploaded from "+path)
    } catch (e) {
        console.log(currentDT_Str+" Unable to upload elastic cert ssl. ",e);
    }
    break;
  }
}

const sslElasticKeyPath = [path.join(__dirname, '..', 'ssl', 'elastic_cert.key'),'/etc/ssl/elastic_cert.key']

for (let i = 0; i < sslElasticKeyPath.length; i++) {
  let path = sslElasticKeyPath[i]
  if (fs.existsSync(path)) {
    try {

        elastic_ssl_certs.key = fs.readFileSync(path, 'utf8');
        console.log(currentDT_Str+" SSL elastic key uploaded from "+path)
    } catch (e) {
        console.log(currentDT_Str+" Unable to upload elastic key ssl. ",e);
    }
    break;
  }
}

const sslElasticCAPath = [path.join(__dirname, '..', 'ssl', 'elastic_cert.ca'),'/etc/ssl/elastic_cert.ca']

for (let i = 0; i < sslElasticCAPath.length; i++) {
  let path = sslElasticCAPath[i]
  if (fs.existsSync(path)) {
    try {
        elastic_ssl_certs.ca = fs.readFileSync(path, 'utf8');
        console.log(currentDT_Str+" SSL elactic CA uploaded from "+path)
    } catch (e) {
        console.log(currentDT_Str+" Unable to upload elastic CA ssl. ",e);
    }
    break;
  }
}

module.exports = {
get_app_config:app_config,
get_ssl_certs:ssl_certs,
get_elastic_ssl_certs:elastic_ssl_certs
}
