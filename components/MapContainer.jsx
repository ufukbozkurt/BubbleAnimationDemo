/******* VIEW IMPORTS *******/
import React from 'react';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import ControlPanel from './controlPanel/ControlPanel.jsx';
/******* APPLICATION IMPORTS *******/
import BubbleAnimation from '../animatedBubbles/animatedBubbles.js';

import gtd_geojson from '../data/gtd2017.json';
/***********************************/

class MapContainer extends React.Component {
   constructor(props) {
      super(props); 

      this.state = { 
        style:{
          "circle-radius-stops":{property:"olusayisi",breaks:[[0,3],[300,300]]},
          "circle-color-stops":{property:"olusayisi",breaks:[[0,"#9CE500"],[25,"#DDE100"],[50,"#DD9E00"],[80,"#D95A00"],[150,"#D51800"],[300,"#FF0000"]]},
          "circle-stroke-width":1,
          "circle-stroke-color":"#ffffff",
          "circle-blur": 1,
        }, 
        date:0,
        dateline:[],
        ready:false
      }  
      this.layer=null;
   }
   componentDidMount(){
    	mapboxgl.accessToken = "<Your Access Token>";
  		var map = new mapboxgl.Map({
		    container: 'map',
        style: "mapbox://styles/mapbox/dark-v9",
		    center: [0, 0],
		    zoom: 1
  		});
  		map.on('load', function() {
        //console.log(gtd_geojson);
      
        this.layer = new BubbleAnimation( 
                                          map,
                                          gtd_geojson,
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

        this.layer.play();
         
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
