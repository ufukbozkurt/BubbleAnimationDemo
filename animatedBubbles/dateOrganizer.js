///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

    const ObserverManagement = function(){
        var observers = {};

        this.registerObserver = function( id, func ){
            observers[id] = func;
        }

        this.deregisterObserver = function( id ){
            if( observers[id] ) delete observers[id];
        }

        this.noticeObservers = function(/*msg,id1,id2,id3,...*/){
            const args = arguments;
            const msg = args[0];
            for( var i = 1 ; i < args.length ; i++){
                observers[ args[i] ]( msg );
            }
        }

        this.dispose = function(){
            observers = {};//garbage collector will do the job
        }
    }

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

function DateOrganizer(imap,geojson,dateprop="date",dateObserverFunc=null){
    const self = this;
    const map = imap;

    var turl;
    var geojson
    var dateHash = {};

    var ready = false;
    var readyTimeout=null;

    const observerManager = new ObserverManagement();
    
    const changeDates = function( features ){
        
        var newDateHash = {};

        features.map( f => {

            if( f.properties[ dateprop ] ){

                var date = f.properties[ dateprop ];
                
                if( newDateHash[date] ) newDateHash[date].push(f);
                else newDateHash[date] = [f];
                
            }

        });

        dateHash = newDateHash;

        if( dateObserverFunc ){
            observerManager.noticeObservers( self.getDateline(), "dob" );
        }

        console.log("DATES_CHANGED");
    }

    this.getLength = () => Object.keys(dateHash).length;

    this.getDateline = () =>{
        var dates = Object.keys(dateHash);
        dates.sort( function(a,b){
            const d1 = a.split("-");
            const d2 = b.split("-");

            if( d1[0] < d2[0]) return -1;
            else if( d1[0] > d2[0]) return 1;

            else if( d1[1] < d2[1]) return -1;
            else if( d1[1] > d2[1]) return 1;

            else if( d1[2] < d2[2]) return -1;
            else if( d1[2] > d2[2]) return 1;

        } );
        return dates;
    }

    this.getDate = function(/* dates... */){
        var dates = arguments;
        
        var features = [];
        for( var i = 0; i < dates.length; i++){
            if( dateHash[ dates[i] ] ) features = features.concat( dateHash[ dates[i] ] );
        }
///console.log("dates",dates);
        return {
            "type": "FeatureCollection",
            "features": features
        }
    }

    // this.getHash = function( date ){
    //     return dateHash;
    // }

    this.startWhenReady = function(callback){
        if(!ready){
            readyTimeout = setTimeout(function(){ 
                
                this.startWhenReady( callback );
            }.bind(this), 1000);
        }
        else{
            if(readyTimeout!=null){
                clearTimeout(readyTimeout);
                readyTimeout = null;
            }
            callback();
        }
    }

    this.setDateProperty = function( iDprop ){
        dateprop = iDprop;
    }

    this.dispose = function(){
        if(tileObserver) tileObserver.dispose();
        dateHash = {};
        ready = false;
        readyTimeout = null;
        observerManager.dispose();
    }

    if( dateObserverFunc ) observerManager.registerObserver( "dob", dateObserverFunc );
    
    changeDates( geojson.features );
    ready = true;
    
}

/************************************************************/
/************************************************************/
/************************************************************/
/************************************************************/
/************************************************************/
/************************************************************/

module.exports={
    DateOrganizer:DateOrganizer,
    ObserverManagement:ObserverManagement
}
