/*global osmo:true $:true*/


/*
	*ADD AUTHOUR AND LISCENSE*
*/

'use strict';
export default class {}

window.osmo = window.osmo || {};
/**
 * ------------------------------------------------
 * class:	PopupInteraction
 * desc:
 * ------------------------------------------------
 */
osmo.PopupInteraction = class {

	constructor(){
		console.log('osmo.PopupInteraction - constructor');
		//
		this.PAPER = osmo.scroll.PAPER;
		this.LEGENDSVG = osmo.legendsvg;
		this.DATASVG = osmo.datasvg;
		//
		this.currentFocus = null;
		//
	}

	init(){
		//
		$('#popcancel').click(function(){
			this.close();
		}.bind(this));
		//
		$('#focused_waveform_state').click(function(){
			let curr_val = $('#focused_waveform_state').html();
			if(curr_val == '▶')
				$('#focused_waveform_state').html('<b>Ⅱ</b>');
			if(curr_val == '<b>Ⅱ</b>')
				$('#focused_waveform_state').html('▶');
		});
		//
	}

	close(){
		let legendsvg = this.LEGENDSVG;
		//
		$('#focused-cta').hide();
		$('#focused-info').hide();
		$('#'+this.currentFocus+'_waveform').hide();
		document.body.style.cursor = 'default';
		//
		let fac = 1.005/(this.PAPER.view.zoom*this.PAPER.view.zoom);
		let currentCenter = this.PAPER.view.center;
		let newCenter = osmo.scroll.prevBoundsCenter;
		let zoomFac = osmo.scroll.prevZoom;
		//
		//let zoomFac = 1;
		if(legendsvg.popupBBoxes.hasOwnProperty(this.currentFocus)){
			let count = legendsvg.popupBBoxes[this.currentFocus]['paths'].length;
			console.log(count);
			for(let i=0; i < count; i++){
				legendsvg.popupBBoxes[this.currentFocus]['paths'][i].selected = false;
				legendsvg.popupBBoxes[this.currentFocus]['paths'][i].visible = false;
			}
			console.log('Decided zoom - ' + zoomFac);
		}
		//
		this.currentFocus = null;
		osmo.scroll.hitPopupMode = 'hovering';
		this.hitMaskEffect(new this.PAPER.Point(0,0), 'exit');
		//
		let deltaValX = newCenter.x - currentCenter.x;
		let deltaValY = newCenter.y - currentCenter.y;
		//
		this.PAPER.view.zoom = osmo.pzinteract.changeZoom(this.PAPER.view.zoom, 1, zoomFac, false);
		this.PAPER.view.center = osmo.pzinteract.changeCenter(this.PAPER.view.center, deltaValX, deltaValY, fac);
		//
	}

	/**
	 * ------------------------------------------------
	 * mouseClicked
	 * ------------------------------------------------
	 */
	mouseClicked(event){
		let legendsvg = this.LEGENDSVG;
		//
		if(document.body.style.cursor == 'zoom-in'){
			console.log('Zoom-in at this place');
			this.PAPER.view.zoom = osmo.pzinteract.changeZoom(this.PAPER.view.zoom, -1, 1.015, false);
		}
		//
		if(osmo.scroll.loaded.HQimage && osmo.scroll.loaded.svgdata){
			if(osmo.scroll.hitPopupMode != 'focused'){
				this.hitMaskEffect(event.point, 'click');
			}
		}
		//
	}

	/**
	 * ------------------------------------------------
	 * hitMaskEffect
	 * ------------------------------------------------
	 */
	hitMaskEffect(pt, ctype){
		let legendsvg = this.LEGENDSVG;
		//
		let fromOpacity = osmo.datasvg.backgroundLayer.opacity, toOpacity;
		let fromColor = new this.PAPER.Color($('body').css('background-color')), toColor;
		let tweening = false;
		let dur = 800;
		let lg;
		//
		let hitResult = legendsvg.maskLayer.hitTest(pt, osmo.scroll.maskHitOptions);
		if(hitResult != null){
			//
			legendsvg.legendLayer.visible = true;
			lg = this.PAPER.project.getItem({name: hitResult.item.data.legendName});
			if(lg == null)	return;
			//
			if(ctype == 'click'){
				$('#focused-info').animate({ right:'0px'}, 1200);
				//
				toOpacity = 0;
				toColor =  new this.PAPER.Color('#24292b');
				//
				osmo.scroll.hitPopupMode = 'focused';
				legendsvg.maskLayer.visible = false;
				document.body.style.cursor = 'zoom-in';
				//
				this.currentFocus = parseInt(hitResult.item.data.legendName.replace('legend-', ''));
				console.log('Focused on: ' + this.currentFocus );
				//
				//
				$('#focused-heading').text(legendsvg.datasets[this.currentFocus].title);
				$('#focused-description').text(legendsvg.datasets[this.currentFocus].desc);
				//
				$('#focused-cta').show();
				$('#focused-info').show();
				$('#'+this.currentFocus+'_waveform').show();
				if($('#'+this.currentFocus+'_waveform').length)
					$('#focused_waveform_state').show();
				else
					$('#focused_waveform_state').hide();
				//
				if(legendsvg.popupBBoxes.hasOwnProperty(this.currentFocus)){
					let count = legendsvg.popupBBoxes[this.currentFocus]['paths'].length;
					for(let i=0; i < count; i++){
						legendsvg.popupBBoxes[this.currentFocus]['paths'][i].visible = false;// true to show rect box
						legendsvg.popupBBoxes[this.currentFocus]['paths'][i].selected = false;
					}
					//
					// Zoom into selected area!
					let fac = 1.005/(this.PAPER.view.zoom*this.PAPER.view.zoom);
					let currentViewCenter = this.PAPER.view.bounds.center;
					let newViewCenter = legendsvg.popupBBoxes[this.currentFocus]['paths'][0].bounds.center;
					let zoomFac = fac * 0.5 * osmo.scroll.paperWidth / (1.0 * legendsvg.popupBBoxes[this.currentFocus]['paths'][0].bounds.width);
					let deltaValX = newViewCenter.x - currentViewCenter.x + 250.0/zoomFac;
					let deltaValY = -(newViewCenter.y - currentViewCenter.y);
					//
					osmo.scroll.prevBoundsCenter = new this.PAPER.Point(this.PAPER.view.center.x, this.PAPER.view.center.y);
					this.PAPER.view.center = osmo.pzinteract.changeCenter(this.PAPER.view.center, deltaValX, deltaValY, fac, false);
					//
					//
					osmo.scroll.prevZoom = zoomFac;
					this.PAPER.view.zoom = osmo.pzinteract.changeZoom(this.PAPER.view.zoom, -1, zoomFac, false);
					//
				}
				//
			}
			//
			//
		}else{
			toOpacity = 1.0;
			toColor =  new this.PAPER.Color('#b5ced5');
			//
			$('#focused-info').animate({ right:'-500px'}, 100);
			//
			legendsvg.legendLayer.visible = false;
			document.body.style.cursor = 'default';
			for(let i=0; i<legendsvg.legendLayer.children.length; i++){
				let child = legendsvg.legendLayer.children[i];
				child.visible = false;
			}
			//
		}
		//
		if(!tweening){
			setTimeout(function(){tweening = false;}, dur*1.2);
			osmo.datasvg.backgroundTweenItem.tween(
			    { val: 1.0 },
			    { val: 0.0 },
			    { easing: 'easeInOutQuad', duration: dur }
			).onUpdate = function(event) {
				tweening = true;
				//
				let currentVal = osmo.datasvg.backgroundTweenItem.val;
				let lerpedColor = new osmo.scroll.PAPER.Color(
					toColor.red+(fromColor.red-toColor.red)*currentVal,
					toColor.green+(fromColor.green-toColor.green)*currentVal,
					toColor.blue+(fromColor.blue-toColor.blue)*currentVal);
				//
				osmo.datasvg.backgroundLayer.opacity = toOpacity + (fromOpacity - toOpacity) * currentVal;
				$('body').css('background-color',  lerpedColor.toCSS(true));
				//
				if(typeof lg !== 'undefined'){
					if(!lg.visible && currentVal == 0){
						for(let i=0; i<legendsvg.legendLayer.children.length; i++){
							let child = legendsvg.legendLayer.children[i];
							child.visible = false;
						}
						lg.visible = true;
					}
				}
				//
			};
		}
		//
		//
	}

};