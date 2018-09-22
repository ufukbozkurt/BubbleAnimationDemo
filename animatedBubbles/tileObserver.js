import Pbf from 'pbf';
import VT from '@mapbox/vector-tile';

/************************************************************/
/************************************************************/
/************************************************************/
/************************************************************/
/************************************************************/
/************************************************************/

export default function TileObserver(imap,tempUrl){
    const self = this;
    const map = imap;
    const tUrl = tempUrl;

    var loadedtiles = [];
    var reqtileids = []; //tiles which are already requested//experimental//
    var observers = [];

    const noticeObservers = function(){
        for( var i in observers ){
            observers[ i ]( self.getCurrent() );
        }
    } 

    const moveEventHandler = function(){ getTileCoordinates(map); }

    const getVTRequest = function (path,callback=null){
        //TODO: Add arrayBuffer function to sendAjax return object, in order to eleminate whatwg-fetch
        fetch( path, {
            method: 'GET'
        }).then(function(response) {
            return response.arrayBuffer();
        }).then(function(a){
            callback(a);
        });
    }

    const request = function( tileMeta, callback ){//request vector tiles converts to geojson
        const url = tUrl.replace("{z}",tileMeta.z).replace("{x}",tileMeta.x).replace("{y}",tileMeta.y);
        getVTRequest(url,function(result){

            const vttile = new VT.VectorTile( new Pbf(result) );
            //console.log("TILE",vttile);
            const vtlayer = vttile.layers["layer_data"];
            var featureArray = [];
            //console.log("LAYER",vtlayer);
            //console.log("GJ CONVERSION STARTS");
            if(vtlayer){
                for( var i = 0; i < vtlayer.length; i++){
                    featureArray.push(vtlayer.feature(i).toGeoJSON( tileMeta.x, tileMeta.y, tileMeta.z ))
                }

            }
            //console.log("featureArray",featureArray);
            //console.log("GJ CONVERSION ENDS");
            tileMeta.features = featureArray;
            callback( tileMeta );
        });
    }

    const requestChain = function( tiles, callback=null ){
        var recnt=0;
        var twl = [];//tiles with load
        for( var i = 0; i < tiles.length; i++){

           request( tiles[i], function( t ){
                twl.push( t );
                recnt++;
                if( recnt == tiles.length){
                    //console.log("ALL_DONE");
                    callback(twl);
                }
           });

        }   
    }

    const getTileCoordinates = function(map){

      function long2tile(lon,zoom) { //http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
        return (Math.floor((lon+180)/360*Math.pow(2,zoom))); 
      }

      function lat2tile(lat,zoom)  { //http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
        return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); 
      }

      var bounds = map.getBounds();
      var zoom = Math.floor( map.getZoom() );
      var tileCoords = [];

      var x1 = long2tile( bounds._ne.lng, zoom );
      var y1 = lat2tile( bounds._ne.lat, zoom );
      
      var x2 = long2tile( bounds._sw.lng, zoom );
      var y2 = lat2tile( bounds._sw.lat, zoom );

      for( var i = x2 ; i <= x1 ; i++){
        for( var j = y1 ; j <= y2 ; j++){

          tileCoords.push( {
            z: zoom,
            x: i,
            y: j
          });

        }
      }
      manageCache( tileCoords );
    }

    const manageCache = function(newtiles){

        const tileId = ( tile ) => tile.z+""+tile.x+""+tile.y;

        var cachedTiles = [];
        var requestTiles = [];

        for( var i = 0; i < newtiles.length ; i++){
            var cTile = loadedtiles.filter( l => newtiles[i].z==l.z && newtiles[i].x==l.x && newtiles[i].y==l.y );
            if( cTile.length > 0 ){
                cachedTiles.push( cTile[0] );
            }
            else{
                if( !reqtileids.includes( tileId( newtiles[i] ) ) ){
                    requestTiles.push( newtiles[i] );
                    reqtileids.push( tileId( newtiles[i] ) );
                }
            }  
        }
//console.log("=>",newtiles,cachedTiles,requestTiles);
        requestChain( requestTiles, function( tilesWithLoad ){
            var twlids = tilesWithLoad.map( twl => tileId(twl) );
            reqtileids = reqtileids.filter( tid => !twlids.includes(tid) );
            loadedtiles = cachedTiles.concat( tilesWithLoad ); 
            noticeObservers();
        } );

    }

    this.getCurrent = () => loadedtiles;

    this.addObserverFunc = function( of, id){
        observers[id] = (of);
    }

    this.removeObserverFunc = function( id ){
        delete observers[id];
    }  

    this.dispose = function(){
        for(var i in observers) this.removeObserverFunc( observers[i] );
        map.off("moveend",moveEventHandler);
        loadedtiles = [];
    }

    //map.showTileBoundaries = true;

    map.on("moveend",moveEventHandler);
    getTileCoordinates(map);
}

/************************************************************/
/************************************************************/
/************************************************************/
/************************************************************/
/************************************************************/
/************************************************************/
