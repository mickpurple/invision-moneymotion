/* VIEW TEMPLATES */
ips.templates.set('downloads.submit.screenshot', " \
	<div class='ipsUploader__row ipsUploader__row--withBorder ipsUploader__row--image ipsAttach ipsContained {{#done}}ipsAttach_done{{/done}}' id='{{id}}' data-role='file' data-fileid='{{id}}' data-filesize='{{sizeRaw}}' data-fullsizeurl='{{imagesrc}}' data-thumbnailurl='{{thumbnail}}' data-fileType='image'>\
		<div class='ipsUploader__rowPreview ipsType_center' data-role='preview'>\
			<label for='{{field_name}}_primary_screenshot_{{id}}' class='ipsCursor_pointer'>\
				{{#thumb}}\
					{{{thumb}}}\
				{{/thumb}}\
				<div class='ipsUploader__rowPreview__generic ipsFlex ipsFlex-ai:center ipsFlex-jc:center' {{#thumb}}style='display: none'{{/thumb}}>\
					<i class='fa fa-{{extIcon}} ipsType_large'></i>\
				</div>\
			</label>\
		</div>\
		<div class='ipsUploader_rowMeta ipsFlex ipsFlex-fd:column ipsFlex-jc:center ipsFlex-ai:start'>\
			<h2 class='ipsUploader_rowTitle ipsMargin:none ipsType_reset ipsAttach_title ipsTruncate ipsTruncate_line' data-role='title'>{{title}}</h2>\
			<p class='ipsDataItem_meta ipsType_medium ipsType_light'>\
				{{size}} {{#statusText}}&middot; <span class='ipsType_light' data-role='status'>{{statusText}}</span>{{/statusText}}\
			</p>\
			{{#status}}<span class='ipsAttachment_progress'><span data-role='progressbar'></span></span>{{/status}}\
		</div>\
		<span data-role='insert' {{#insertable}}style='display: none'{{/insertable}}>\
			<a href='#' class='ipsAttach_selection' data-ipsTooltip title='{{#lang}}insertIntoPost{{/lang}}'>\
				<i class='fa fa-plus'></i>\
			</a>\
		</span>\
		{{#supportsDelete}}\
			<div data-role='deleteFileWrapper' {{#newUpload}}style='display: none'{{/newUpload}}>\
				<input type='hidden' name='{{field_name}}_keep[{{id}}]' value='1'>\
				<a href='#' data-role='deleteFile' class='ipsUploader__rowDelete' data-ipsTooltip title='{{#lang}}attachRemove{{/lang}}'>\
					&times;\
				</a>\
			</div>\
		{{/supportsDelete}}\
		{{^supportsDelete}}\
			<div data-role='deleteFileWrapper' style='display: none'>\
				<input type='hidden' name='{{field_name}}_keep[{{id}}]' value='1'>\
				<a href='#' class='ipsUploader__rowDelete' data-role='deleteFile' data-ipsTooltip title='{{#lang}}attachRemove{{/lang}}'>&times;</a>\
			</div>\
		{{/supportsDelete}}\
		<label for='{{field_name}}_primary_screenshot_{{id}}' class='cDownloadsPrimaryRadio' data-ipsTooltip title='{{#lang}}makePrimaryScreenshot{{/lang}}'>\
			<span class='ipsCustomInput'>\
				<input type='radio' name='{{field_name}}_primary_screenshot' id='{{field_name}}_primary_screenshot_{{id}}' value='{{id}}' {{#default}}checked{{/default}}>\
				<span></span>\
			</span>\
			{{#lang}}makePrimary{{/lang}}\
		</label>\
	</div>\
");

ips.templates.set('downloads.submit.screenshotWrapper', " \
	<div class='ipsUploader__container ipsUploader__container--images'>{{{content}}}</div>\
");

ips.templates.set('downloads.submit.linkedScreenshot', " \
	<li class='cDownloadsLinkedScreenshotItem'>\
		<input type='url' name='{{name}}[{{id}}]' value='{{value}}'>\
		<div class='cDownloadsLinkedScreenshotItem_block'>\
			<input type='radio' name='screenshots_primary_screenshot' value='{{id}}' title='{{#lang}}makePrimaryScreenshot{{/lang}}' data-ipsTooltip {{extra}}>\
		</div>\
		<div class='cDownloadsLinkedScreenshotItem_block'>\
			<a href='#' data-action='removeField' title='{{#lang}}removeScreenshot{{/lang}}' data-ipsTooltip><i class='fa fa-times'></i></a>\
		</div>\
	</li>\
");