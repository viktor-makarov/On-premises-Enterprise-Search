var router = require('express').Router();
const access_controll = require('../access_controll');
const mongo = require('../mongo');
const upload = require('../upload');

router.get('/users/getUser', access_controll.getUser);
router.post('/api/loggs/queryvalue', mongo.queryvalue);
router.post('/api/download_file', upload.download);

router.get('*', function(req, res){res.render('index')}); //Эта часть должна быть в конце, после всех api запросов

module.exports = router;
