/******* VIEW IMPORTS *******/
import React from 'react';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
/******* APPLICATION IMPORTS *******/
import BubbleAnimation from '../animatedBubbles/animatedBubbles.js';

/***********************************/

/*
   layer = BubbleAnimation( map, 
                           vectorTileUrl, 
                           duration in seconds, 
                           style,
                           date prop name,
                           value callback )

   layer.stop() => to reset and pause animation
   layer.pause() = to pause animation
   layer.play() = to play animation
   layer.dispose() = to destroy everyting and permanently finish animation

   style spec: 
     "circle-radius": static radius value 
     "circle-radius-stops": { property: property from vector url for radius, breaks:[[ input value 1, radius value 1],[ input value 2, radius value 2],...]}

     "circle-color":  static color value
     "circle-color-stops": { property: property from vector url for color , breaks:[[ input value 1, color value 1],[ input value 2, color value 2],...]}

     "circle-opacity": static stroke opacity
     "circle-stroke-width": style["circle-stroke-width"] || 1,
     "circle-stroke-color": static stroke color
     "circle-stroke-opacity": begin stroke opacity


     -you can either use circle-radius or circle-radius-stops
     -you can either use circle-color or circle-color-stops

     notes:
         - value callback is called for every second.
         - duration should not be less than 20 seconds for big data otherwise fps rate may decrease
         - It may take time for animation to load

*/

class MapContainer extends React.Component {
   constructor(props) {
      super(props);   
   }
   componentDidMount(){
    	mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eXN1cmYiLCJhIjoiSERMSzhPYyJ9.QdFRZUBmE4tjG5G94X_hAg';
		var map = new mapboxgl.Map({
		    container: 'map',
          style: "mapbox://styles/mapbox/dark-v9",
		    center: [0, 0],
		    zoom: 1
		});
		map.on('load', function() {
			let layer = new BubbleAnimation( map,
                                          "http://servis.pirireis.com.tr:8090/Pbf/{z}/{x}/{y}.pbf/?q=SELECT%20t1.geom%20as%20%22geom%22%2C(t1.olusayisi)%20as%20%22olusayisi%22%2CTO_CHAR(t1.tarih%2C'YYYY-MM-DD')%20as%20%22tarih%22%20FROM%20gtd2017%20t1%20&connection=NPtgpYhHbgOqqPyncRV2OA7Dgo%2B4Qs8DdL4oGu3JVQeKbL0Yw21gbi%2FzHK5GMNFR&db=pg&layername=layer_data&geomtype=point&simplifyPointBaseZoom=1",
                                          30,
                                          {  "circle-radius-stops":{property:"olusayisi",breaks:[[0,3],[300,30]]},
                                             "circle-color-stops":{property:"olusayisi",breaks:[[0,"#9CE500"],[25,"#DDE100"],[50,"#DD9E00"],[80,"#D95A00"],[150,"#D51800"],[300,"#FF0000"]]},
                                             "circle-stroke-color":"#fff",
                                          },
                                          "tarih",(val)=>{ console.log( "val", val ) });
         /*
         //Animation control test code:
         setTimeout(() => {
            layer.pause();
            console.log("PAUSE");
            setTimeout(() => { 
               layer.play(); 
               console.log("PLAY");
               setTimeout(() => { 
                  layer.stop(); 
                  console.log("STOP");
                  setTimeout(() => { 
                     layer.play(); 
                     console.log("PLAY");
                     setTimeout(() => { 
                        layer.dispose(); 
                        console.log("DISPOSED");
                     },3000);
                  },3000);
               },3000);
            },3000);
         },15000);
         */
      });
   }

   render() {
      return (
         <div id="map" className="main-map" ></div>
      );
   }
}


export default MapContainer;
