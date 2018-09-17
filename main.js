import React from 'react';
import ReactDOM from 'react-dom';

import MapContainer from './components/MapContainer.jsx';

window.addEventListener("load", function(event) {
    
  
	ReactDOM.render((
		<MapContainer/>
	), document.getElementById('app'));


});


