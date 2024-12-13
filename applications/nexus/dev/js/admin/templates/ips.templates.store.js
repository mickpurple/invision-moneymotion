ips.templates.set('nexus.store.images', " \
	<div class='ipsGrid_span3 ipsAttach ipsImageAttach ipsPad_half ipsAreaBackground_light' id='{{id}}' data-role='file' data-fileid='{{id}}' data-fullsizeurl='{{imagesrc}}' data-thumbnailurl='{{thumbnail}}' data-fileType='image'>\
		<ul class='ipsList_inline ipsImageAttach_controls'>\
			<li><input type='radio' name='{{field_name}}_primary_image' value='{{id}}' title='{{#lang}}makePrimaryProductImage{{/lang}}' data-ipsTooltip></li>\
			<li class='ipsPos_right' data-role='deleteFileWrapper'>\
				<input type='hidden' name='{{field_name}}_keep[{{id}}]' value='1'>\
				<a href='#' data-role='deleteFile' class='ipsButton ipsButton_verySmall ipsButton_light' data-ipsTooltip title='{{#lang}}removeProductImage{{/lang}}'><i class='fa fa-trash-o'></i></a>\
			</li>\
		</ul>\
		<div class='ipsImageAttach_thumb ipsType_center' data-role='preview' data-grid-ratio='65' data-action='insertFile' {{#thumb}}style='background-image: url( \"{{thumbnail_for_css}}\" )'{{/thumb}}>\
			{{#status}}\
				<span class='ipsImageAttach_status ipsType_light' data-role='status'>{{{status}}}</span>\
				<span class='ipsAttachment_progress'><span data-role='progressbar'></span></span>\
			{{/status}}\
			{{#thumb}}\
				{{{thumb}}}\
			{{/thumb}}\
		</div>\
		<h2 class='ipsType_reset ipsAttach_title ipsType_medium ipsTruncate ipsTruncate_line' data-role='title'>{{title}}</h2>\
		<p class='ipsType_light'>{{size}} &middot; <span data-role='status'>{{statusText}}</span></p>\
	</div>\
");
