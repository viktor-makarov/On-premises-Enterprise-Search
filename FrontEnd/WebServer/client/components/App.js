import React, { Component } from 'react';
//import {BrowserRouter} from 'react-router-dom';
//import {Routes ,Route} from 'react-router-dom'
import SearchMainView from './SearchMainView';
import 'bootstrap/dist/css/bootstrap.min.css';

const browserHandler = {
	ie: () => <div className="browser-detection-banner">
	<h4 >
	Search намного лучше работает в Chrome, Firefox, Yandex, Opera или Safary.
	</h4>
	</div>,
};

class App extends Component {

render() {

return (
<div>
<SearchMainView/>
  </div>
    )
  }
};
export default App;
