ips.templates.set('club.request.approve', "\
	<span class='cClubRequestCover_icon ipsAreaBackground_positive'>\
		<i class='fa fa-check'></i>\
	</span>\
	<br>\
	<span class='ipsBadge ipsBadge_large ipsBadge_positive'>{{#lang}}clubRequestApproved{{/lang}}</span>\
");

ips.templates.set('club.request.decline', "\
	<span class='cClubRequestCover_icon ipsAreaBackground_negative'>\
		<i class='fa fa-times'></i>\
	</span>\
	<br>\
	<span class='ipsBadge ipsBadge_large ipsBadge_negative'>{{#lang}}clubRequestDenied{{/lang}}</span>\
");

ips.templates.set('club.menu.dragHandle', "\
	<span data-role='clubMenuDrag' style='display: none'><i class='fa fa-bars'></i> &nbsp;</span>\
");