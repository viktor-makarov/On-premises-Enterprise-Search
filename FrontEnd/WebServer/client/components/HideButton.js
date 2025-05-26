import React,{Component} from 'react';
import {Collapse,Button} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faAngleDown,faAngleUp} from '@fortawesome/free-solid-svg-icons'


class HideButton extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.state = {"isOpen":this.props.initialState}
    this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);
  }

  onCheckboxBtnClick() {
    this.setState({isOpen: !this.state.isOpen});
  }

  handleChange(event, errors, values) {
    this.props.onFieldListChange((event.target.value !== "true"),event.target.name);
  }

  render() {
    const arrowDown = <FontAwesomeIcon icon={faAngleDown} size="xs"/>
    const arrowUp = <FontAwesomeIcon icon={faAngleUp} size="xs"/>



    return (
      <div>
      <Button block color={"link"} outline active = {this.state.isOpen} onClick={this.onCheckboxBtnClick} className="hide-button-class">{this.props.title} {this.state.isOpen?arrowUp:arrowDown}</Button>
      <Collapse isOpen={this.state.isOpen} className="hide-collapce-class">
          {this.props.main_element}
      </Collapse>
    </div>
    );
  }
};

export default HideButton;
