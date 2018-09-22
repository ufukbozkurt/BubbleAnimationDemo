/******* VIEW IMPORTS *******/
import React from 'react';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import ControlPanel from './controlPanel/ControlPanel.jsx';
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

      this.state = { 
        style:{
          "circle-radius-stops":{property:"olusayisi",breaks:[[0,3],[300,30]]},
          "circle-color-stops":{property:"olusayisi",breaks:[[0,"#9CE500"],[25,"#DDE100"],[50,"#DD9E00"],[80,"#D95A00"],[150,"#D51800"],[300,"#FF0000"]]},
          "circle-stroke-width":1,
          "circle-stroke-color":"#ffffff",
          "circle-blur": 0,
        }, 
        date:0,
        dateline:[],
        ready:false
      }  
      this.layer=null;
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
      
        this.layer = new BubbleAnimation( 
                                          map,
                                          "http://servis.pirireis.com.tr:8090/Pbf/{z}/{x}/{y}.pbf/?q=SELECT%20t1.geom%20as%20%22geom%22%2C(t1.olusayisi)%20as%20%22olusayisi%22%2CTO_CHAR(t1.tarih%2C'YYYY-MM-DD')%20as%20%22tarih%22%20FROM%20gtd2017%20t1%20&connection=NPtgpYhHbgOqqPyncRV2OA7Dgo%2B4Qs8DdL4oGu3JVQeKbL0Yw21gbi%2FzHK5GMNFR&db=pg&layername=layer_data&geomtype=point&simplifyPointBaseZoom=1",
                                          30,
                                          this.state.style,
                                          "tarih", 
                                          (val)=>{///observer function transmits events
                                            switch( val.type ){
                                              case "started":
                                                this.setState( { ready: true, dateline:this.layer.getDateline() } );
                                                break;
                                              case "stopped":
                                                this.setState( { date:this.state.dateline[0] } );
                                                break;
                                              case "value":
                                                requestAnimationFrame( () => this.setState( { date: val.value } ) );
                                                break;
                                              case "dateline_changed":
                                                this.setState( { dateline:this.layer.getDateline() } );
                                                break;
                                            }
                                          }
                                        );
         
      }.bind(this));
   }

   render() {
      return (
        <div>
          <div id="map" className="main-map" ></div>
          {this.state.ready?(
            <ControlPanel 
              style={ this.state.style }
              dateline={ this.state.dateline }
              date={ this.state.date }

              onStyleChange={ obj =>{
                this.setState( Object.assign( this.state.style, obj ) );
                this.layer.setStyle( obj );
              }}
              onPlayPause={ () => this.layer.play() }
              onStop={ () => this.layer.stop() }
              onDateChange={ (date) => this.layer.setDate(date) }
            />
          ):null}
        </div>
      );
   }
}

export default MapContainer;

///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////TEST CODES////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

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
*//*
  var si = 0;
  var styleArr = [
    {
      "circle-radius-stops":{property:"olusayisi",breaks:[[0,4],[300,40]]},
      "circle-color-stops":{property:"olusayisi",breaks:[[0,"#33FF00"],[300,"#CE1127"]]},
      "circle-stroke-width":0,
      "circle-blur":1
    },
    {
      "circle-radius-stops":{property:"olusayisi",breaks:[[0,2],[300,20]]},
      "circle-color-stops":{property:"olusayisi",breaks:[[0,"#FF00FF"],[25,"#7700C2"],[50,"#B500C6"],[80,"#CA009F"],[150,"#D20027"],[300,"#FF0000"]]},
      "circle-stroke-width":1,
      "circle-stroke-color":"#000",
      "circle-blur":0
    },
    {  
      "circle-radius-stops":{property:"olusayisi",breaks:[[0,3],[300,30]]},
      "circle-color-stops":{property:"olusayisi",breaks:[[0,"#CCFFFF"],[25,"#CCE5FF"],[50,"#E5CCFF"],[80,"#FFCCFF"],[150,"#FF9999"],[300,"#FF3333"]]},
      "circle-stroke-color":"#fff",
      "circle-blur":0.5
    },
    {  
      "circle-radius-stops":{property:"olusayisi",breaks:[[0,3],[300,30]]},
      "circle-color-stops":{property:"olusayisi",breaks:[[0,"#9CE500"],[25,"#DDE100"],[50,"#DD9E00"],[80,"#D95A00"],[150,"#D51800"],[300,"#FF0000"]]},
      "circle-stroke-color":"#fff",
      "circle-blur":0
    }
  ];

  setInterval(()=>{ 
    layer.setStyle( styleArr[ si%styleArr.length ] );
    si++; 
  },10000)
*/
