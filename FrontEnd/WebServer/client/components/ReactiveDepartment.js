import React,{Component} from 'react';
import {Button,Tooltip } from 'reactstrap';
import DepartmentComponent from './DepartmentComponent';


class ReactiveDepartment extends React.Component {

    render() {

        return (
            <DepartmentComponent
                className={this.props.className}
                departmentTitle={this.props.departmentTitle}

                onChange={(value,query) => {
                  this.props.setQuery({
                        query:query,
                        value: value
                    })
                }}
            />
        )
    }
}

export default ReactiveDepartment;
