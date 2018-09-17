import {DateOrganizer,ObserverManagement} from "./dateOrganizer.js";

function flatenArray(arr, depth=1){
	return arr.reduce(function (flat, toFlatten) {
        return flat.concat((Array.isArray(toFlatten) && (depth-1)) ? toFlatten.flat(depth-1) : toFlatten);
    }, []);
}

function TintedBubbles( imap, iid, data, style, beforeId=undefined  ){
	const self = this;
	const map = imap;
	const id = iid;
	const buildInterpolation = ( ramp ) => ramp?["interpolate",["linear"],["get",ramp.property]].concat( flatenArray( ramp.breaks) ):undefined;

	map.addSource(id, {
        "type": "geojson",
        "data": data
    });

	map.addLayer({
        "id": id,
        "type": "circle",
        "source": id,
        "layout": {
        	"visibility":"visible"
        },
        "paint":{
        	"circle-radius": buildInterpolation( style["circle-radius-stops"] ) || style["circle-radius"] || 5,
            "circle-color":  buildInterpolation( style["circle-color-stops"] )  || style["circle-color"]  || "#990000",

	        "circle-opacity": style["circle-opacity"] || 1,
	        "circle-stroke-width": style["circle-stroke-width"] || 1,
	        "circle-stroke-color": style["circle-stroke-color"] || "#000000",
	        "circle-stroke-opacity": style["circle-stroke-opacity"] || 1,
	        //"circle-blur":1
        }
    },beforeId);

    this.setData = function(data){
        map.getSource(id).setData( data );
    }

    this.setStyle = function(style){

    	for( var stype in style ){
    		map.setPaintProperty(id, stype, style[stype]);
    	}

    }

    this.setVisibility = function( visible ){
        const value = (visible)?("visible"):("none")
        map.setLayoutProperty(id, "visibility", value);              
    }

    this.move = function(bid){
        map.moveLayer(id,bid);
    }

    this.dispose = function(){
        map.removeLayer(id);
        map.removeSource(id);
    }

}

export default function BubbleAnimation( imap, iurl, duration, style, dateprop, dateObserverFunc=null){
	const self = this;
	const map = imap;
	const url = iurl;

	var pause = false;
	var animateBubbles = null;
	var layersManager;
	var observerManager;
	var fader;

	const dateorganizer = new DateOrganizer(map,url,dateprop,(newDateLine)=>{
		if( fader ) fader.updateKeys(newDateLine,false)
	});

	var animReqId = null;

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	const Fader = function( ikeys, min, step, maxActiveKeyCount=10 ){
		/* determines opacity of dates */
		const self = this;
		var keys = [];
		const opacityStep = step;
		const minOpacity = min;
		var nextthreshold = 0.3;

		var current, currentIndex; 

		this.updateKeys = function( ikeys, reset=true ){
			const activeKeyCount = Math.max( ( ikeys.length * ( ( 1 - minOpacity ) / opacityStep ) ) / ( duration * 60 ) , 2 );
			const activecount = Math.min( activeKeyCount, maxActiveKeyCount );
			const groupCount = Math.ceil( activeKeyCount/maxActiveKeyCount  );
			nextthreshold = 1 - ( Math.floor( ( 1 / activecount ) * 10 ) / 10 );

			var bkeyIndex = 0;
			if( !reset ){
				var indexKeys = keys[ currentIndex ].split("&");
				var last = indexKeys[ indexKeys.length - 1];
				bkeyIndex = Math.ceil( ikeys.indexOf(last)/groupCount );
				//console.log("bkeyIndex",bkeyIndex,last);
			}
			
			var groupedKeys = [];
			if(groupCount > 1){
				//console.log("groupCount",groupCount);
				for( var i = 0; i < ikeys.length; i+= groupCount){
					var gkey = "";
					for( var j = 0; j < groupCount; j++){
						gkey += ikeys[ (i+j) ];
						if( j+1 < groupCount && (i + j + 1) < ikeys.length ){
							gkey += "&";
						}
						else break;
					}
					groupedKeys.push( gkey );
				}

				keys = groupedKeys;
			}
			else{
				keys = ikeys;
			}
			//console.log("keys",keys);
			currentIndex = bkeyIndex;
			current=[ keys[ bkeyIndex ], 1 ];

		}

		this.next = function(){
			//console.log( "date", keys[currentIndex] );
			for( var i = 0; i < current.length; i+=2 ){
				current[i+1] = current[i+1] - opacityStep;
				
				if( current[i+1] <= min ){
					current.splice(i,2);
				}
				if( i+1 == current.length-1 && current[i+1] <= nextthreshold ){
					currentIndex = (currentIndex+1)%keys.length;//loop
					current.push( keys[currentIndex], 1 );
					break;
				}
			}
			return current;
		}

		this.reset = function(){
			currentIndex = 0;
			current=[ keys[ currentIndex ], 1 ];
		}

		this.dispose = function(){
			this.reset();
			keys = [];
		}

		self.updateKeys(ikeys);
	}

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	const LayerManagement = function( istyle ){
		var layers = [];

		var style = istyle;

		this.updateLayers = function( faderNext ){
			var activeKeys = faderNext.filter( (v,i) => i%2==0 );

			//console.log( "=>>", activeKeys );

			for( var i = 0; i < faderNext.length; i+=2 ){
				var lindex = layers.findIndex( l => l.key == faderNext[i]);
				if( lindex > -1 ){
					layers[ lindex ].layer.setStyle({
						"circle-opacity": faderNext[i+1],
						"circle-stroke-opacity": faderNext[i+1]
					});
				}
				else{
					var idleLayers = layers.filter( l => !activeKeys.includes(l.key) );
					if( idleLayers.length > 0 ){
						

						idleLayers[ 0 ].key = faderNext[i];
						idleLayers[ 0 ].layer.setData( dateorganizer.getDate( ...faderNext[i].split("&") ) );
						idleLayers[ 0 ].layer.setStyle({
							"circle-opacity":faderNext[i+1],
							"circle-stroke-opacity":faderNext[i+1]
						});

					}
					else{

						layers.push({
							key: faderNext[i],
							layer: new TintedBubbles(map,"ba_"+layers.length, dateorganizer.getDate( ...faderNext[i].split("&") ),style)
						});
						//console.log(layers);

					}
				}
			}

		}

		this.dispose = function(){
			for( var i = 0; i < layers.length; i++ ) layers[i].layer.dispose();
			layers = [];
		} 
	}

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

	dateorganizer.startWhenReady(function(){
		
		var dateline = dateorganizer.getDateline();
		//console.log("dateline",dateline);

		const minOpacity = 0.1;
		const opacityStep = 0.05;//these 3lines assumes that fps is 60. if not then animation time will not be equal duration :(

		//console.log("activedays",activedays);
		observerManager = new ObserverManagement();
		if( dateObserverFunc ) observerManager.registerObserver( "dob", dateObserverFunc );

		layersManager = new LayerManagement( style );
		fader = new Fader( dateline, minOpacity, opacityStep );

		var frameCount=0;
		var timing=0;

		animateBubbles = function(timestamp) {

            try {

            	if(!pause) animReqId = requestAnimationFrame(animateBubbles);

                var opacityCond = fader.next() ;

                layersManager.updateLayers( opacityCond );
   
            	frameCount++;
                if(timing==0) timing = performance.now();
                if( ( performance.now() - timing ) >= 1000 ){
                	//console.log("fps",frameCount); 
                	timing=0;
                	frameCount=0;
                	if( dateObserverFunc ){
	                	var last = opacityCond[opacityCond.length-2].split("&");
	                	observerManager.noticeObservers( last[ last.length - 1 ] , "dob" );
	                }
                }

            }
            catch(err){ //if error occurs when animation playing, stop
            	console.error("Error",err);
            }

	    };

	    animReqId = requestAnimationFrame(animateBubbles);

	});

	this.pause = function(){
		if(animateBubbles){
			pause=true;
			cancelAnimationFrame(animReqId);
		}
		else{
			console.warn("Animation is not started!");
		}
	}

	this.play = function(){
		if(animateBubbles){
			if( pause ){
				pause = false;
				animateBubbles( performance.now() );
			}
		}
		else{
			console.warn("Animation is not started!");
		}
	}

	this.stop = function(){
		if(animateBubbles){
			pause=true;
			cancelAnimationFrame(animReqId);
			layersManager.dispose();
			fader.reset();
		}
		else{
			console.warn("Animation is not started!");
		}
	}

	this.dispose = function(){
		cancelAnimationFrame(animReqId);
		layersManager.dispose();
		fader.dispose();
		dateorganizer.dispose();
	}

}


