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
    	mapboxgl.accessToken = "pk.eyJ1IjoidWZ1a2Jvemt1cnQiLCJhIjoiUExkVVVQayJ9.ZBMMVm95zTbvvIuMELOerA";
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
                                          gtd_geojson,//"http://servis.pirireis.com.tr:8090/Pbf/{z}/{x}/{y}.pbf/?q=SELECT%20t1.geom%20as%20%22geom%22%2C(t1.olusayisi)%20as%20%22olusayisi%22%2CTO_CHAR(t1.tarih%2C'YYYY-MM-DD')%20as%20%22tarih%22%20FROM%20gtd2017%20t1%20&connection=NPtgpYhHbgOqqPyncRV2OA7Dgo%2B4Qs8DdL4oGu3JVQeKbL0Yw21gbi%2FzHK5GMNFR&db=pg&layername=layer_data&geomtype=point&simplifyPointBaseZoom=1",
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
