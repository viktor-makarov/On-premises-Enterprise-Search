var express = require('express');

var path = require('path');
const app_config = require('./app_config');
global.app_config = app_config.get_app_config; //в этой переменной будут храниться основные настройки приложения

const ssl_certs = app_config.get_ssl_certs;
const elastic_ssl_certs = app_config.get_elastic_ssl_certs;

global.elastic_config = Object.assign({}, global.app_config.ELASTIC, elastic_ssl_certs);
global.mongo_config = global.app_config.MONGODB
global.ad_config = global.app_config.AD
var app = express();
var https = require( 'https' );
var router = require('./routes/routes.js')
var body_Transform = require('./esTransformBody')
var appurl = global.app_config.DOMAIN;
const helmet = require('helmet');
var {createProxyMiddleware} = require('http-proxy-middleware');
const currentDT = new Date();
const currentDT_Str = currentDT.toISOString()
var port = 8000

const sessions = require('./sessions');
var bodyParser = require('body-parser');

app.use(sessions.session_auth);
//app.use(express.json());
/* Parse the ndjson as text
*/

app.use((req, res, next) => {
    const { body} = req;

    //console.log('Verifying requests ✔', body);
    /* After this we call next to tell express to proceed
     * to the next middleware function which happens to be our
     * proxy middleware */
    next();
})

app.set('trust proxy', true);
//app.use(express_enforces_ssl())
//Это часть отвечает за авторизацию. Она должна быть обязательно перед функциями обработки запросов пользователей
//В зависимоти от OS используется либо один, либо другой модуль авторизмации
console.log("Current OS =",process.platform)
switch (process.platform) {
  case "win32":
    var auth = require('./authorization_win.js')
    app.use(auth.nodeSSPIAuth);
  break;

  case "linux":
    var auth = require('./authorization_linux.js');
    app.use(auth.krb5_auth);
  break;

  default:
  break;
};


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client'));
app.use(express.static(path.join(__dirname, '../client')));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        baseUri:["'self'"],
        fontSrc: ["'self'", "http:"," data:"],
        frameAncestors: ["'self'"],
        imgSrc: ["'self'", "data:"],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "http:", "'unsafe-inline'"],
        connectSrc: ["'self'",appurl,"https://sr-as-2.prs-va.ru:8000","https://search.prs-va.ru:1443","https://search.prs-va.ru:2443"] ,
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
        blockAllMixedContent: []
      },
      reportOnly: true
    })
);
app.use(bodyParser.text({ type: 'application/x-ndjson' }));

const options = {
target: global.elastic_config.protocol + '://' + global.elastic_config.address,
pathRewrite: {'^/elasticsearch' : `/${global.elastic_config.index_alias}`},
secure: false,
ssl: {cert:global.elastic_config.cert,key:global.elastic_config.key,ca:global.elastic_config.ca},
xfwd: false,
changeOrigin: true,

onProxyRes(proxyRes, req, res) {},
//Здесь мы берем запрос от клиента, и изменяем его перед отправкой в ES
onProxyReq:body_Transform.es_body_transform
};
app.use('/elasticsearch', createProxyMiddleware(options));
app.use(bodyParser.json());
app.use('/', router);
https.createServer(ssl_certs, app).listen(port, () => console.log(`Access this application at https://${process.env.NODE_ENV==="production"? global.app_config.DOMAIN : "localhost:" + port}`));
 

