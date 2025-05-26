import React,{Component} from 'react';
//import { AvForm, AvGroup, AvInput } from 'availity-reactstrap-validation';
import {Button, Label, FormGroup, ToastBody,Toast,Badge,Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faAngleDown,faAngleUp} from '@fortawesome/free-solid-svg-icons'

class FieldControl extends Component {
  constructor(props) {
    super(props);

    const search_fields = Object.keys(this.props.search_fields)
    this.currentfields ={};
    search_fields.map((item)=>{
      this.currentfields[item]=this.props.search_fields[item].status
  	})
  //console.log("FieldControl",this.currentfields)
  //  console.log(this.currentfields)
    this.handleChange = this.handleChange.bind(this);
    this.state = {"isOpen":true}
    this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);
  }

  onCheckboxBtnClick() {
    this.setState({isOpen: !this.state.isOpen});
  }

  handleChange(event, errors, values) {
  //  console.log("checked",event.target.checked)
    this.currentfields[event.target.name]=!this.currentfields[event.target.name]
    this.props.onFieldListChange((!this.props.search_fields[event.target.name].status),event.target.name);
    //this.props.onFieldListChange((event.target.value !== "true"),event.target.name);
  }

  handle(e){
    console.log(e)
  }

  render() {

    const currentSearchFields = this.props.search_fields
    const listOfFields = Object.keys(this.currentfields)
    let list_of_fields_true = this.props.search_fields_true
    if (list_of_fields_true.length===0){
      list_of_fields_true = Object.keys(this.props.search_fields)
    }

    //const listOfFields = Object.keys(currentSearchFields)
    const arrowDown = <FontAwesomeIcon icon={faAngleDown}/>
    const arrowUp = <FontAwesomeIcon icon={faAngleUp} />

  /*  const model = {};

    listOfFields.map((item)=>{
      model[item]=currentSearchFields[item].status
      return model[item]
  	})*/

    function RenderCheckBoxes(list,handle,currentFields) {

        return (
          <div>
          {list.map((item)=>(

            <div>
            <Label check>
            {/*<Input type="checkbox" name={item} onChange={handle}/>*/}
            <input
              type="checkbox"
              onChange={handle}
              id={item}
              name={item}
              checked={currentFields[item]}
              />{' '}
              {currentSearchFields[item].name}
            </Label>
            </div>
        ))}
        </div>
    )}

    return (
      <div>
      <Button active = {this.state.isOpen} block outline onClick={this.onCheckboxBtnClick} className="search-field-button" color="secondary">Список полей для поиска {this.state.isOpen?arrowUp:arrowDown} <Badge pill size = {"xs"} color={"secondary"} >{list_of_fields_true.length}/{Object.keys(currentSearchFields).length}</Badge></Button>
      <Toast isOpen={this.state.isOpen} className="search-toast-class">
        <ToastBody>
        <FormGroup check>
              {RenderCheckBoxes(listOfFields,this.handleChange,this.currentfields)}
              </FormGroup>
        </ToastBody>
      </Toast>
    </div>
    );
  }
};

export default FieldControl;
