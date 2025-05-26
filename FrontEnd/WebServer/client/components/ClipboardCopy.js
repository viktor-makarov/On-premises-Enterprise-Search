import React,{Component} from 'react';


class ClipboardCopyButton extends Component {

  constructor(props) {
    super(props);

    this.updateClipboard = this.updateClipboard.bind(this);
  }

  updateClipboard() {
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    const newClip = this.props.copyText
    const key = this.props.keyElement
      navigator.clipboard.writeText(newClip).then(function() {

        document.getElementById(key).innerHTML = "Скопировано";
        sleep(2000)
        .then(() =>{document.getElementById(key).innerHTML = "Копировать путь к файлу в буфер"})

      }, function() {
        //clipboard write failed
        document.getElementById(key).innerHTML = "Ой! Что-то пошло не так";
      });
    }

  render() {

    return (
      <span className={this.props.className}>
      <button id="1a"
      className="copyButton"
      onClick={this.updateClipboard}
        >
        <span  class="copy_button_tooltip">Копировать
          <span id = {this.props.keyElement} class="tooltiptext">Копировать путь к файлу в буфер</span>
        </span>
        </button>
    </span>
    );
  }
};

export default ClipboardCopyButton;
