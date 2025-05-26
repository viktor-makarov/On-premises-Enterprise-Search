const contentDisposition = require('content-disposition');

const fs = require('fs');

const download = (req, res) => {

  const fileName = req.body.filename;
  let path = req.body.filepath;

  if(process.platform==="linux"){
    path = path.replace('\\\\', '\\').split('\\').join('/')
  }

  const fileStream = fs.createReadStream(path);
  let fileStat = fs.statSync(path);
  res.set({
        'Content-Disposition': contentDisposition(fileName),
        'Content-Length':fileStat.size
      });
  fileStream.pipe(res);

/*  res.download(path, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
      console.log("Could not download the file. " + err)
    }
  });*/

};

module.exports = {
download:download
}
