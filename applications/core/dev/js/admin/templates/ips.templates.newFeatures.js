ips.templates.set('newFeatures.card', " \
	<div class='acpNewFeature_card' data-role='card'>\
		<img src='{{image}}' class='acpNewFeature_image'>\
		<div class='acpNewFeature_info'>\
			<h2 class='acpNewFeature_title'>{{title}}</h2>\
			<p class='acpNewFeature_desc'>{{description}}</p>\
			{{#moreInfo}}<a href='{{moreInfo}}' class='acpNewFeature_button ipsButton ipsButton_verySmall ipsButton_primary'>{{#lang}}findOutMore{{/lang}}</a>{{/moreInfo}}\
		</div>\
	</div>\
");

ips.templates.set('newFeatures.dot', " \
	<li class='acpNewFeature_dot' data-role='dot'><a href='#' data-dotIdx='{{i}}' data-role='dotFeature'></a></li>\
");

ips.templates.set('newFeatures.wrapper', " \
	<div class='acpNewFeature' data-role='newFeatures'>\
		<div class='acpNewFeature_wrap'>\
			<a href='#' class='acpNewFeature_close' data-action='closeNewFeature' data-ipsTooltip title='{{#lang}}close{{/lang}}'>&times;</a>\
			<a href='#' class='acpNewFeature_arrow acpNewFeature_next' data-action='nextFeature'><i class='fa fa-angle-right'></i></a>\
			<a href='#' class='acpNewFeature_arrow acpNewFeature_prev' data-action='prevFeature'><i class='fa fa-angle-left'></i></a>\
			<div class='acpNewFeature_inner'>\
				<h1 class='acpNewFeature_mainTitle' data-role='mainTitle'>{{#lang}}whatsNew{{/lang}}</h1>\
				<div class='acpNewFeature_cardWrap'>\
					{{{cards}}}\
				</div>\
				<ul class='acpNewFeature_dots ipsList_reset' data-role='dots'>\
					{{{dots}}}\
				</ul>\
			</div>\
		</div>\
	</div>\
");