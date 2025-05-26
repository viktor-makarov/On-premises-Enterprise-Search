import React,{Component} from 'react';
import  {Button }  from 'reactstrap';


class DepartmentComponent extends Component {
  constructor(props) {
    super(props);

    this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);

  }

  onCheckboxBtnClick() {

       const query = {
                        query: {
                            term: { departmentfilter: this.props.departmentTitle }
                        }
                    };
       this.props.onChange(this.props.departmentTitle,query);
                  }

  render() {

    function DepartmentFineTune(dept) {

      let departmentSring;
      if(dept){
     	 departmentSring = dept[0].charAt(0).toUpperCase()+dept[0].slice(1)
      }
      return departmentSring
    }

    return (
      <div>

          <Button
            color={"link"}
            onClick={this.onCheckboxBtnClick}
            className="fileNameLine-button-class"
            >
            <span
            className={this.props.className}
            dangerouslySetInnerHTML={{__html: DepartmentFineTune(this.props.departmentTitle)}}
            >
            </span>
          </Button>
      </div>
    );
  }
};

export default DepartmentComponent;
