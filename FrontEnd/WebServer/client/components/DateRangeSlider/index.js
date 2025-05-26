import React, { Component } from 'react';
import PropTypes from 'prop-types';
// ReactiveComponent allows us to convert our own components into ReactiveSearch components
import { ReactiveComponent } from '@appbaseio/reactivesearch-native';
// RangeSlider logic goes here
import RangeSlider from './DateRangeSlider';


class CustomDateRangeSlider extends Component {
  render() {
    // Destructuring the props
    const {
      componentId,
      field,
      title,
      step,
    } = this.props;
    
    // Wrapping the RangeSlide inside the ReactiveComponent
    return (
      <ReactiveComponent
        componentId={componentId}
        defaultQuery={() => ({
          aggs: {
            maximum: { max: { field } },
            minimum: { min: { field } },
          },
        })}
      >
        <DateRangeSlider title={title} field={field} step={step} id={componentId} />
      </ReactiveComponent>
    );
  }
}


CustomDateRangeSlider.propTypes = {
  componentId: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  step: PropTypes.number,
  title: PropTypes.string.isRequired,
};

CustomDateRangeSlider.defaultProps = {
  step: 1,
};

export default CustomDateRangeSlider;