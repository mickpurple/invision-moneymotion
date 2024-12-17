ips.templates.set('dashboard.widget'," 	<li id='elWidget_{{key}}' data-widgetKey='{{key}}' data-widgetName='{{name}}' data-widgetBy='{{by}}' style='display: none'>		<div class='ipsBox acpWidget_item'>			<h2 class='ipsBox_titleBar ipsType_reset'>				<ul class='ipsList_reset ipsList_inline acpWidget_tools'>					<li>						<a href='#' class='acpWidget_reorder ipsJS_show ipsCursor_drag' data-ipsTooltip title='Reorder widget'><i class='fa fa-bars'></i></a>					</li>					<li>						<a href='#' class='acpWidget_close' data-ipsTooltip title='Close widget'><i class='fa fa-times'></i></a>					</li>				</ul>				{{name}} {{#by}}<span class='ipsType_light ipsType_medium ipsType_unbold'>By {{by}}</span>{{/by}}			</h2>			<div class='ipsPad' data-role='widgetContent'>				{{content}}			</div>		</div>	</li>");ips.templates.set('dashboard.menuItem'," 	<li class='ipsMenu_item' data-ipsMenuValue='{{key}}' data-widgetName='{{name}}' data-widgetBy='{{by}}'>		<a href='#'>{{name}}</a>	</li>");;
;(function($,_,undefined){"use strict";ips.controller.register('core.admin.dashboard.adminNotes',{initialize:function(){this.on('submit','form',this.saveNotes);},saveNotes:function(e){e.preventDefault();var url=$(e.currentTarget).attr('action');var self=this;this.scope.find('[data-role="notesInfo"]').hide();this.scope.find('[data-role="notesLoading"]').removeClass('ipsHide');ips.getAjax()(url,{type:'post',data:$('#admin_notes').serialize()}).done(function(response){self.scope.find('[data-role="notesInfo"]').html(response);}).fail(function(){}).always(function(){self.scope.find('[data-role="notesInfo"]').show();self.scope.find('[data-role="notesLoading"]').addClass('ipsHide');});}});}(jQuery,_));;
;(function($,_,undefined){"use strict";ips.controller.register('core.admin.dashboard.main',{_managing:false,initialize:function(){this.on('click','.acpWidget_close',this.closeWidget);this.on('click','[data-widgetCollapse]',this.collapseWidget);this.on(document,'menuItemSelected','#elAddWidgets:not( .ipsButton_disabled )',this.addWidget);this.on('refreshWidget','[data-widgetKey]',this.refreshWidget);this.setup();},setup:function(){this.mainColumn=this.scope.find('[data-role="mainColumn"]');this.sideColumn=this.scope.find('[data-role="sideColumn"]');this.scope.find('[data-role="sideColumn"]').sortable({handle:'.acpWidget_reorder',forcePlaceholderSize:true,placeholder:'acpWidget_emptyHover',connectWith:'[data-role="mainColumn"]',tolerance:'pointer',start:this.startDrag,stop:_.bind(this.stopDrag,this),update:_.bind(this.update,this)});this.scope.find('[data-role="mainColumn"]').sortable({handle:'.acpWidget_reorder',forcePlaceholderSize:true,placeholder:'acpWidget_emptyHover',connectWith:'[data-role="sideColumn"]',tolerance:'pointer',start:this.startDrag,stop:_.bind(this.stopDrag,this),update:_.bind(this.update,this)});this.scope.find('[data-widgetCollapsed="true"][data-widgetCollapse-content]').hide();},startDrag:function(e,ui){$('body').attr('data-dragging',true).css({overflow:'scroll'});ui.item.css({zIndex:ips.ui.zIndex()});},stopDrag:function(e,ui){$('body').removeAttr('data-dragging').css({overflow:'auto'});$(ui.item).trigger('sorted.dashboard',{ui:ui});this._loadWidget($(ui.item).attr('data-widgetkey'));$('#ipsTooltip').hide();},update:function(){this._savePositions();},closeWidget:function(e){e.preventDefault();var self=this;var widget=$(e.currentTarget).closest('[data-widgetKey]');var key=widget.attr('data-widgetKey');var name=widget.attr('data-widgetName');widget.animationComplete(function(){widget.remove();self.mainColumn.sortable('refresh');self.sideColumn.sortable('refresh');self._savePositions();});widget.animate({height:"0"});ips.utils.anim.go('zoomOut fast',widget);$('#elAddWidgets_menu').find('[data-ipsMenuValue="'+key+'"]').removeClass('ipsHide');this.scope.find('#elAddWidgets_button').removeClass('ipsButton_disabled').removeAttr('data-disabled');},collapseWidget:function(e){e.preventDefault();if($(e.target).is('i')){return;}
var self=this;var widget=$(e.currentTarget).closest('[data-widgetKey]');var collapsed=widget.find('[data-role="widgetContent"]').attr('data-widgetCollapsed');widget.find('[data-role="widgetContent"]').attr('data-widgetCollapsed',(collapsed=='true')?'false':'true');widget.find('[data-widgetCollapse-content]').slideToggle();widget.find('.acpWidget_collapse i').removeClass('fa-caret-right').removeClass('fa-caret-down').addClass((collapsed=='true')?'fa-caret-down':'fa-caret-right');this._savePositions();},addWidget:function(e,data){data.originalEvent.preventDefault();var item=data.menuElem.find('[data-ipsMenuValue="'+data.selectedItemID+'"]');var key=item.attr('data-ipsMenuValue');var name=item.attr('data-widgetName');var newWidget=ips.templates.render('dashboard.widget',{key:key,name:name});this.mainColumn.prepend(newWidget);var newWidgetElem=this.mainColumn.find('#elWidget_'+key);ips.utils.anim.go('fadeIn',newWidgetElem);this._loadWidget(key);this._savePositions();setTimeout(function(){item.addClass('ipsHide');},500);if(!data.menuElem.find('[data-ipsMenuValue]:not( .ipsHide ):not( [data-ipsMenuValue="'+data.selectedItemID+'"] )').length){this.scope.find('#elAddWidgets_button').addClass('ipsButton_disabled').attr('data-disabled',true);}},_loadWidget:function(key){var widget=this.scope.find('[data-widgetKey="'+key+'"]');if(!widget.length){return;}
widget.find('[data-role="widgetContent"]').css({height:widget.find('[data-role="widgetContent"]').outerHeight()+'px',}).html('').addClass('ipsLoading');ips.getAjax()('?app=core&module=overview&controller=dashboard&do=getBlock',{data:{appKey:key.substr(0,key.indexOf('_')),blockKey:key}}).done(function(response){widget.find('[data-role="widgetContent"]').css({height:'auto'}).html(response).removeClass('ipsLoading');$(document).trigger('contentChange',[widget]);});},refreshWidget:function(e){var key=$(e.currentTarget).attr('data-widgetKey');this._loadWidget(key);},_savePositions:function(){var main=this.mainColumn.sortable('toArray',{attribute:'data-widgetKey'});var side=this.sideColumn.sortable('toArray',{attribute:'data-widgetKey'});var collapsed=_.map(this.scope.find('[data-widgetCollapsed="true"]'),function(elem){return $(elem).closest('[data-widgetKey]').attr('data-widgetKey');});ips.getAjax()('?app=core&module=overview&controller=dashboard&do=update',{data:{blocks:{'main':main,'side':side,'collapsed':collapsed}}}).done(function(){}).fail(function(){ips.ui.alert.show({type:'alert',icon:'warn',message:ips.getString('dashboard_cant_save'),callbacks:{}});});}});}(jQuery,_));;
;(function($,_,undefined){"use strict";ips.controller.register('core.admin.dashboard.onboard',{initialize:function(){this.on('click','[data-role="sectionToggle"]',this.toggleSection);this.on('click','[data-action="nextStep"]',this.nextStep);this.on('click','[data-action="skipStep"]',this.skipStep);this.setup();},setup:function(){},toggleSection:function(e){e.preventDefault();this.scope.find('[data-role="sectionWrap"]').addClass('cOnboard__section--closed');$(e.currentTarget).closest('.cOnboard__section').toggleClass('cOnboard__section--closed');$(document).trigger('contentChange',[$(e.currentTarget).closest('.cOnboard__section')]);},nextStep:function(e){e.preventDefault();var wrap=$(e.currentTarget).closest('.cOnboard__section');var nextWrap=wrap.next('.cOnboard__section');if(nextWrap.length){$('html, body').animate({scrollTop:String(wrap.position().top-70)},function(){setTimeout(function(){wrap.addClass('cOnboard__section--closed cOnboard__section--done');nextWrap.removeClass('cOnboard__section--closed');$(document).trigger('contentChange',[nextWrap]);},200);});}else{wrap.addClass('cOnboard__section--closed cOnboard__section--done');}}});}(jQuery,_));;
;(function($,_,undefined){"use strict";ips.controller.register('core.admin.dashboard.validation',{initialize:function(){this.on('click','[data-action="approve"], [data-action="ban"]',this.validateUser);},validateUser:function(e){e.preventDefault();var self=this;var button=$(e.currentTarget);var url=button.attr('href');var type=button.attr('data-action');var row=button.closest('[data-role="validatingRow"]');var name=row.find('[data-role="userName"]').text();var toggles=button.closest('[data-role="validateToggles"]');ips.ui.alert.show({type:'confirm',callbacks:{'ok':function(){toggles.find('a').addClass('ipsButton_disabled');ips.getAjax()(url).done(function(response){ips.ui.flashMsg.show(ips.getString(type=='approve'?'userApproved':'userBanned',{name:name}));if(response){var newElement=$(response);$(self.scope).replaceWith(newElement);$(document).trigger('contentChange',[newElement]);}else{ips.utils.anim.go('fadeOut',$(self.scope).closest('.cNotification'));$('body').trigger('updateNotificationCount');}});}}});}});}(jQuery,_));;