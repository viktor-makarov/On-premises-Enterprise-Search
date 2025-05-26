import React,{Component} from 'react';



class FileNameLine extends Component {
  constructor(props) {
    super(props);
    this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);
  }

  onCheckboxBtnClick() {
    //console.log("Вы нажали на кнопку")
    //Здесь можно логировать действия перехода по линку
  }

  explorerreff_link(action_link){

   let linkwithprotocol;


   if (action_link){
     linkwithprotocol = "explorerreff:" + action_link
   };
   return linkwithprotocol
  }

  render() {

    return (


  <span>
        <a onClick={this.onCheckboxBtnClick}
        href={this.explorerreff_link(this.props.actionLink)}
        className={this.props.className} dangerouslySetInnerHTML={{
            __html: this.props.Name}}>
        </a>

    </span>

    );
  }
};

export default FileNameLine;
