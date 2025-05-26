import React,{Component} from 'react';
import { Form, FormGroup, Label, Input, Row,Col } from 'reactstrap';

class StrategySwitcher extends Component {
//export function StrategySwitcher (props) {

constructor() {
  super();
  this.handleChange = this.handleChange.bind(this);
}

handleChange(event) {
    this.props.onStrategyChange(event.target.value);
  }

render() {

  return (
    <div>
    <Form>
      <Row form className = "radio-button-class">
        <Col>
        <FormGroup check>
          <Label check className = "radio-button-class-label">
          <Input  className = "radio-button-class-circle" type="radio" name="radio12"  value="word" checked={this.props.search_strategy === "word"} onChange={this.handleChange}/>
            &nbsp;искать по словам и фразам
          </Label>
        </FormGroup>
        </Col>
        <Col>
        <FormGroup check>
          <Label check className = "radio-button-class-label">
            <Input className = "radio-button-class-circle" type="radio" name="radio24" value="char" checked={this.props.search_strategy === "char"} onChange={this.handleChange}/>
            &nbsp;искать по нескольким символам
          </Label>

        </FormGroup>
        </Col>
        </Row>
    </Form>
    </div>
  );
}
}

export default StrategySwitcher;
