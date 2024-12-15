ips.templates.set('gallery.submit.imageItem', " \
	<div class='ipsAttach ipsImageAttach ipsPad_half ipsAreaBackground_light {{#done}}ipsAttach_done{{/done}}' id='{{id}}' data-role='file' data-fileid='{{id}}' data-fullsizeurl='{{imagesrc}}' data-thumbnailurl='{{thumbnail}}' data-isImage='1'>\
		<ul class='ipsList_inline ipsImageAttach_controls'>\
			<li data-role='insert' {{#insertable}}style='display: none'{{/insertable}}><a href='#' data-action='insertFile' class='ipsAttach_selection' data-ipsTooltip title='{{#lang}}insertIntoPost{{/lang}}'><i class='fa fa-plus'></i></a></li>\
			</li>\
			<li class='ipsPos_right' {{#newUpload}}style='display: none'{{/newUpload}} data-role='deleteFileWrapper'>\
				<input type='hidden' name='{{field_name}}_keep[{{id}}]' value='1'>\
				<a href='#' data-role='deleteFile' class='ipsButton ipsButton_verySmall ipsButton_light' data-ipsTooltip title='{{#lang}}attachRemove{{/lang}}'><i class='fa fa-trash-o'></i></a>\
			</li>\
		</ul>\
		<div class='ipsImageAttach_thumb ipsType_center' data-role='preview' data-grid-ratio='65' data-action='insertFile' {{#thumb}}style='background-image: url( \"{{thumbnail}}\" )'{{/thumb}}>\
			{{#status}}\
				<span class='ipsImageAttach_status ipsType_light' data-role='status'>{{{status}}}</span>\
				<span class='ipsAttachment_progress'><span data-role='progressbar'></span></span>\
			{{/status}}\
			{{#thumb}}\
				{{{thumb}}}\
			{{/thumb}}\
		</div>\
		<h2 class='ipsType_reset ipsAttach_title ipsType_medium ipsTruncate ipsTruncate_line cGalleryImageAttach_info' data-role='title'>{{title}}</h2>\
		<p class='ipsType_light cGalleryImageAttach_info'>{{size}} {{#statusText}}&middot; <span data-role='status'>{{statusText}}</span>{{/statusText}}</p>\
	</div>\
");

ips.templates.set('gallery.submit.imageItemWrapper', " \
	<div class='cGallerySubmit_fileList'>{{{content}}}</div>\
");