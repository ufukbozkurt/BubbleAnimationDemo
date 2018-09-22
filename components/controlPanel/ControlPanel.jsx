import React from 'react';

export default class ControlPanel extends React.Component {
	render(){
		const style = this.props.style;
		var panelStyle = {
			position: "absolute",
			right: "5px",
			top: "5px",
			background: "rgba(255, 255, 255, 0.5)",
			padding: "5px",
			borderRadius: "3px",
			fontFamily: "helvetica"
		};

		const onChange = ( type, value ) => {
			if( type == "circle-radius-stops" ){
				var newStyle = style["circle-radius-stops"];
				newStyle.breaks = value.split(",").map( v => parseInt(v) );
				this.props.onStyleChange({"circle-radius-stops":newStyle});
			}
			else if( type == "circle-color-stops"){
				var newStyle = style["circle-color-stops"];
				newStyle.breaks = value.split(",").map( (v,i) => (i%2==0)?parseInt(v):v );
				this.props.onStyleChange({"circle-color-stops":newStyle})
			}
			else{
				var obj = {};

				obj[ type ] = value;
				this.props.onStyleChange( obj );
			}
		}
		
		return (
			<div style={panelStyle} >
				<table>
					<tbody>
						<tr>
							<td>Radius:</td>
							<td>
								<input 
									type="text" 
									value={style["circle-radius-stops"].breaks}
									onChange={ e => onChange( "circle-radius-stops", e.currentTarget.value ) }
								/>
							</td>
						</tr>
						<tr>
							<td>Color:</td>
							<td>
								<input 
									type="text" 
									value={style["circle-color-stops"].breaks}
									onChange={ e => onChange( "circle-color-stops", e.currentTarget.value ) }
								/>
							</td>
						</tr>
						<tr>
							<td>Stroke Width:</td>
							<td>
								<input 
									type="number" 
									min="1" 
									max="10"
									value={style["circle-stroke-width"]}
									onChange={ e => onChange( "circle-stroke-width", parseInt( e.currentTarget.value ) ) }
								/>
							</td>
						</tr>
						<tr>
							<td>Stroke Color:</td>
							<td> 
								<input 
									type="color" 
									id="head" 
									name="color" 
									value={style["circle-stroke-color"]}
									onChange={ e => onChange( "circle-stroke-color", e.currentTarget.value ) }
								/>
							</td>
						</tr>
						<tr>
							<td>Blur:</td>
							<td>
								<input 
									type="number" 
									step="0.1" 
									min="0" 
									max="1"
									value={style["circle-blur"]}
									onChange={ e => onChange( "circle-blur", parseFloat( e.currentTarget.value ) ) }
								/>
							</td>
						</tr>
						<tr><td colSpan="2"><hr/></td></tr>
						<tr>
							<td><button onClick={ this.props.onPlayPause } >Play/Pause</button></td>
							<td><button onClick={ this.props.onStop } >Stop</button></td>
						</tr>
						<tr><td colSpan="2"><hr/></td></tr>
						<tr><td colSpan="2" style={{textAlign:"center"}}>{this.props.date}</td></tr>
						<tr>
							<td colSpan="2">
								<input 
									type="range" 
									min="0"
									max={this.props.dateline.length-1}
									step="1"
									value={ this.props.dateline.indexOf( this.props.date ) }
									onChange={ e => this.props.onDateChange( this.props.dateline[ parseInt(e.currentTarget.value) ] ) }
									style={{width:"100%"}}
								/>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}
}
//