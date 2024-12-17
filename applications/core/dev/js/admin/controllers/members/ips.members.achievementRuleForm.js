/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.members.achievementRuleForm.js - Controller for restrictions screen
 *
 * Author: Mark Wade
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.admin.members.achievementRuleForm', {

		initialize: function () {
			this.on( 'change', 'select[name="achievement_rule_action"]', this.changeRule );
			this.on( 'click', '[data-action="filterReveal"]', this.showFilter );
			this.on( 'click', '[data-action="filterCollapse"]', this.hideFilter );
			this.on( 'change keyup', 'input[type="number"]', this.changeNumber );
			this.on( 'change', 'select[name$="[badge]"]', this.changeBadge );

			this.setup();
		},
		
		setup: function () {
			this._select = this.scope.find('select[name="achievement_rule_action"]');
			this.changeRule();
		},

		changeBadge: function (e) {
			this._changeBadge( $( e.currentTarget ).closest('select[name$="[badge]"]') );
		},

		_changeBadge: function( badgeSelectObj ) {
			const data = badgeSelectObj.attr('name').split('_');
			const translatable = $('#' + data[0] + '_' + data[1] + '_award_' + data[3].replace( '[badge]', '' ) + '_badge' );
			if ( badgeSelectObj.val() > 0 ) {
				translatable.show();
			} else {
				translatable.hide();
			}
		},

		changeRule: function (e) {
			if(e) {
				e.preventDefault();
			}

			const ruleToShow = this.scope.find(`#rule_${this._select.val()}`);
			this.scope.find('[data-role="ruleWrap"]').hide(); // Hide all rule wraps

			ruleToShow.attr('data-ipsForm', true); // Apply the form widget to each individual rule wrapper
			ruleToShow.show();

			this._changeBadge( $('select[name="' + this._select.val() + '_award_subject[badge]"]' ) );
			const otherBadge = $('select[name="' + this._select.val() + '_award_other[badge]"]' );
			if ( otherBadge.length ) {
				this._changeBadge( otherBadge );
			}
			$( document ).trigger('contentChange', [ ruleToShow ] ); // Trigger form init
		},

		showFilter: function (e) {
			const ruleWrap = $( e.currentTarget ).closest('[data-role="ruleWrap"]');
			const toggleWrap = $( e.currentTarget ).closest('[data-role="toggleFilter"]');
			const check = toggleWrap.find('input[type="checkbox"]');
			const toggleRow = toggleWrap.closest('[data-role="conditionButtons"]');

			check.prop('checked', true).trigger('change');
			toggleWrap.hide();
			toggleRow.toggle( toggleRow.find('[data-role="toggleFilter"] input[type="checkbox"]:visible').length > 0 );
			ruleWrap.find(`#${check.attr('data-filter')}`).show();

			if( ruleWrap.find('input[type="number"]') ){
				const self = this;
				ruleWrap.find('input[type="number"]').each( function () {
					self._pluralizeNumber( $( this ) );
				});
			}
		},

		hideFilter: function (e) {
			e.preventDefault();
			const filter = $( e.currentTarget ).closest('[data-role="filterField"]');
			const filterName = filter.attr('id');
			const ruleWrap = filter.closest('[data-role="ruleWrap"]');
			const check = ruleWrap.find(`#${filterName}Checkbox`);
			const toggleWrap = check.closest('[data-role="toggleFilter"]');
			
			check.prop('checked', false).trigger('change');
			toggleWrap.show().closest('[data-role="conditionButtons"]').show();
			filter.hide();
		},

		changeNumber: function (e) {
			this._pluralizeNumber( $( e.currentTarget ) );
		},

		_pluralizeNumber: function (input) {
			const span = input.next('[data-role="th"]');

			if( span.length ){
				span.text( ips.pluralize( ips.getString('numberSuffix'), input.val() ) );
			}
		}
	});
}(jQuery, _));