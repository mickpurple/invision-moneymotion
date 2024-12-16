/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 *
 * ips.modcp.reportToggle.js - Controller for report toggling
 *
 * Author: Rikki Tissier
 */
;( function($, _, undefined){
	"use strict";

	ips.controller.register('core.front.modcp.reportToggle', {

		initialize: function () {
			this.on( 'click', '[data-action="_ipsMenu_ping"]', this.reportToggleClicked );
		},

		/**
		 * Shows an alert before changing the status of a report
		 *
		 * @param 	{Event} 	e 	Event object
		 * @returns {void}
		 */
		reportToggleClicked: function (e) {
			e.preventDefault();
			var elem = $( e.currentTarget );
			var self = this;
			var menuButton = this.scope.find('[data-action="menubutton"]');

			var reportId = this.scope.find('[data-reportId]').attr('data-reportId');
			var newStatus = $(elem).closest('li.ipsMenu_item').attr('data-ipsMenuValue');
			var newStatusText = $(elem).find('[data-role="ipsMenu_selectedText"]').text();
			if ( $(elem).attr('data-showconfirm') != undefined ) {
				if ( $(elem).attr('data-hasNotifications') == 1 ) {
					/* Show an actual modal confirmation dialog via ajax with an optional message to send to the content author */
					var dialogRef = ips.ui.dialog.create({
						title: ips.getString('report_status_change_confirm', { newstatus: newStatusText}),
						size: 'narrow',
						url: '?app=core&module=modcp&controller=modcp&tab=reports&action=reportCenterConfirmModal&id=' + reportId + '&status=' + newStatus,
						forceReload: true,
						remoteSubmit: true
					});

					dialogRef.show();
				} else {
					ips.ui.alert.show({
						type: 'confirm',
						message: ips.getString('report_status_change_confirm'),
						icon: 'fa fa-question-circle',
						buttons: {
							ok: ips.getString('ok'),
							cancel: ips.getString('cancel')
						},
						callbacks: {
							ok: function () {
								menuButton.addClass('ipsLoading ipsLoading_small');
								menuButton.find('span').html('&nbsp;');
								$(elem).attr('data-action', 'ipsMenu_ping').trigger('click');
							},
						}
					});
				}
			} else {
				menuButton.addClass('ipsLoading ipsLoading_small');
				menuButton.find('span').html('&nbsp;');
				$(elem).attr('data-action', 'ipsMenu_ping').trigger('click');
			}
		}
	});
}(jQuery, _));