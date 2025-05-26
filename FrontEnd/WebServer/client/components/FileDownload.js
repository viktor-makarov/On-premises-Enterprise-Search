import React,{Component} from 'react'


var l = null;



class FDownload extends Component {
  constructor(props) {
    super(props);
    this.state = {progress:null}

    var progress = null;

   this.downloadFile = this.downloadFile.bind(this);
  };

  async downloadFile(){

          fetch("/api/download_file",{
            method: 'POST',
            body:JSON.stringify({filename:this.props.filename,filepath:this.props.filepath}),
            headers: {
                'Content-Type': 'application/json'
              }
          })
          .then((response) => {
              const that = this
              const reader = response.body.getReader();
              const contentLength = +response.headers.get('Content-Length');
              let loaded = 0;
              return new ReadableStream({

                start(controller) {

                 return pump();
                  function pump() {
        //          pump = () => {
                    return reader.read()
                    .then(({ done, value }) => {

                      if(value && contentLength!=0){
                        loaded += value.length

                    //    console.log(Math.ceil((loaded / contentLength) * 100))

                       that.setState({progress: Math.ceil((loaded / contentLength) * 100)});
                  //this.setState({isOpen: !this.state.isOpen});


                    };


                      // When no more data needs to be consumed, close the stream
                      if (done) {
                        controller.close();
                        return;
                      }

                      // Enqueue the next data chunk into our target stream
                      controller.enqueue(value);
                      return pump();
                    });
                  }
                }
              })
            })
           .then((stream) => new Response(stream))
           .then((response) => response.blob())
           .then(blob => {
             const fileURL = window.URL.createObjectURL(blob);
             const fileLink = document.createElement('a');
             fileLink.setAttribute('download', this.props.filename);
             fileLink.setAttribute('target', '_blank');

              fileLink.href = fileURL;
               document.body.appendChild(fileLink);

              fileLink.click();
              fileLink.remove();
              this.setState({progress: null});
           })
           .catch((err)=>{console.log(err)})
      };

    render(){

  //    console.log(this.progress)
      return (
        <div >
          <button className="copyButton" onClick={() => this.downloadFile()}>
          <span  class="copy_button_tooltip">Скачать ({this.state.progress ? this.state.progress +"%" : this.props.size})
            <span id = {this.props.keyElement} class="tooltiptext">Скачать файл</span>
          </span>
          </button>
        </div>
      );
   }
}

export default FDownload;
