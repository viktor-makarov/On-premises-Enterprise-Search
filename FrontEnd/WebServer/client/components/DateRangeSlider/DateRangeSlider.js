
import React, { Component } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
// Importing the react-native-multi-slider ui component
import MultiSlider from '@ptomasroos/react-native-multi-slider';

// Calculating the screen width. We're going to use this for setting the width of the range slider
const SCREEN_WIDTH = Dimensions.get('window').width;

class DateRangeSlider extends Component {
  // Setting the state
  state = {
    minimum: 0,                  // minimum value of the range slider
    maximum: 0,                  // maximum value of the range slider
    multiSliderValue: [0, 0],    // react-native-multi-slider value
    firstTime: true,             // this is for checking the component is mounting for the first time
  };

  // This function is called when the range slider values are changing. And it updates the state field multiSliderValue
  multiSliderValuesChange = (values) => {
    this.setState({
      multiSliderValue: values,
    });
  };

  // This fuction executes the query. setQuery is passed into this component because we wrapped it with ReactiveComponent.
  performQuery = (props, queryValue) => {
    props.setQuery({
      query: {
        range: {
          [this.props.field]: queryValue,
        },
      },
    });
  };

  // This funcion is called when user stops dragging the slider handles. And it calls the performQuery function
  onValuesChangeFinish = () => {
    // Settign the query
    const queryValue = { gte: this.state.multiSliderValue[0], lte: this.state.multiSliderValue[1] };
    this.performQuery(this.props, queryValue);
  };

  componentWillReceiveProps(nextProps) {
    // Here we check whether aggregationgs, aggregations.maximum and aggregations.minimum values exist
    if (
      nextProps.aggregations &&
      nextProps.aggregations.maximum &&
      nextProps.aggregations.minimum
    ) {
      // We check for the values in the aggregation and set the state's minimum, maximum, and multiSliderValue fields
      if (
        nextProps.aggregations.minimum.value !== this.state.minimum ||
        nextProps.aggregations.maximum.value !== this.state.maximum
      ) {

          this.setState({
            minimum: nextProps.aggregations.minimum.value,
            maximum: nextProps.aggregations.maximum.value,
            multiSliderValue: [
              nextProps.aggregations.minimum.value,
              nextProps.aggregations.maximum.value,
            ]
          });
      }
      // In the first the component is mounted the filter is not applied. So we execute a match_all query to get all the results
      if (this.state.firstTime) {
        nextProps.setQuery({
          query: {
            match_all: {},
          },
        });
        this.setState({ firstTime: false });
      }
    }
  }

  // Inside the render method, We setup the MultiSlider
  render() {
    const {
      title,
      step,
    } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.valueContainer}>
          <Text>{this.state.multiSliderValue[0]} - {this.state.multiSliderValue[1]}</Text>
        </View>
        <MultiSlider
          values={[this.state.multiSliderValue[0], this.state.multiSliderValue[1]]}
          sliderLength={SCREEN_WIDTH * 0.85}
          onValuesChange={this.multiSliderValuesChange}
          onValuesChangeFinish={this.onValuesChangeFinish}
          min={this.state.minimum}
          max={this.state.maximum}
          step={step}
          allowOverlap={false}
          snapped
          touchDimensions={{
            height: 80,
            width: 80,
          }}
        />
      </View>

    );
  }
}

// Setting the prop types
DateRangeSlider.propTypes = {
  setQuery: PropTypes.func,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  step: PropTypes.number,
};

// Setting default props
DateRangeSlider.defaultProps = {
  step: 1,
  setQuery: () => {},
};

// Styles
const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 40,
  },
  image: {
    width: 40,
    height: 40,
  },
  valueContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    marginBottom: 5,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
});

export default DateRangeSlider;