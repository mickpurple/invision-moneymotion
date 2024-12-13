/**
 * Invision Community
 * (c) Invision Power Services, Inc. - https://www.invisioncommunity.com
 */
/* GENERAL TEMPLATES */
ips.templates.set('core.general.loading', " \
	&nbsp;<span class='ipsType_light'><i class='icon-spinner2 ipsLoading_tinyIcon'></i>&nbsp;&nbsp;&nbsp;</span> {{text}}</span>\
");

ips.templates.set('core.general.ajax', " \
	<div id='elAjaxLoading'><i class='ipsLoading ipsLoading_tiny ipsLoading_dark ipsMargin_right:half'></i> &nbsp;&nbsp;{{#lang}}loading{{/lang}}...</div>\
");

ips.templates.set('core.general.flashMsg', " \
	<div id='elFlashMessage'><div class='ipsFlex ipsFlex-ai:center ipsGap:3 ipsGap_row:0'><div data-role='flashMessage' class='ipsFlex-flex:11'></div><div class='ipsFlex-flex:00'><a href='#' data-action='dismissFlashMessage'>&times;</a></div></div></div>\
");

ips.templates.set('core.hovercard.loading', " \
	<i class='icon-spinner2 ipsLoading_tinyIcon'></i>\
");

/* POST CONTENT */
ips.templates.set('core.posts.spoiler', " \
	<span class='ipsStyle_spoilerFancy_text'><span class='ipsButton ipsButton_verySmall ipsButton_primary ipsButton_narrow'><i class='fa fa-chevron-right'></i></span> {{#lang}}spoilerClickToReveal{{/lang}}</span>\
");

ips.templates.set('core.posts.spoilerOpen', " \
	<span class='ipsStyle_spoilerFancy_text'><span class='ipsButton ipsButton_verySmall ipsButton_primary ipsButton_narrow'><i class='fa fa-chevron-down'></i></span> {{#lang}}spoilerClickToHide{{/lang}}</span>\
");

ips.templates.set('core.posts.multiQuoteOff', " \
	<i class='fa fa-plus'></i>\
");

ips.templates.set('core.posts.multiQuoteOn', " \
	<i class='fa fa-check'></i>\
");

ips.templates.set('core.posts.multiQuoter', " \
	<div id='ipsMultiQuoter'>\
		<button class='ipsButton ipsButton_veryLight ipsButton_small' data-role='multiQuote'><i class='fa fa-comments'></i> &nbsp;&nbsp;{{{count}}}</button> &nbsp;&nbsp;<a href='#' data-action='clearQuoted'><i class='fa fa-times'></i></a>\
	</div>\
");

ips.templates.set('core.menus.menuItem', " \
	<li class='ipsMenu_item {{#checked}}ipsMenu_itemChecked{{/checked}}' data-ipsMenuValue='{{value}}'>\
		<a href='{{link}}'>{{title}}</a>\
	</li>\
");

ips.templates.set('core.menus.menuSep', " \
	<li class='ipsMenu_sep'><hr></li>\
");

ips.templates.set('core.posts.quotedSpoiler', " \
	<p><em>{{#lang}}quotedSpoiler{{/lang}}</em></p>\
");

/* NOTIFICATION TEMPLATE */
ips.templates.set('core.postNotify.single', " \
	<span data-role='newPostNotification' class='ipsType_medium'>\
		<img src='{{photo}}' alt='' class='ipsUserPhoto ipsUserPhoto_tiny ipsPos_middle'> &nbsp;&nbsp;&nbsp;{{{text}}}\
		&nbsp;&nbsp;&nbsp;<a href='#' data-action='loadNewPosts'>{{#lang}}showReply{{/lang}}</a>\
	</span>\
");

ips.templates.set('core.postNotify.multiple', " \
	<span data-role='newPostNotification' class='ipsType_medium'>\
		{{text}}\
		&nbsp;&nbsp;&nbsp;<a href='#' data-action='loadNewPosts'>{{#lang}}showReplies{{/lang}}</a>\
	</span>\
");

ips.templates.set('core.postNotify.multipleSpillOver', " \
	<span data-role='newPostNotification' class='ipsType_medium'>\
		{{text}}\
		{{#canLoadNew}}\
			&nbsp;&nbsp;&nbsp;<a href='#' data-action='loadNewPosts'>{{showFirstX}}</a>\
			&nbsp;&nbsp;&nbsp;<span class='ipsType_light'>{{#lang}}showRepliesOr{{/lang}}</span>\
		{{/canLoadNew}}\
		&nbsp;&nbsp;&nbsp;<a href='{{spillOverUrl}}'>{{#lang}}goToNewestPage{{/lang}}</a>\
	</span>\
");

ips.templates.set('core.notification.flashSingle', " \
	<a href='{{url}}' data-role='newNotification'>\
		<div class='ipsFlex ipsFlex-ai:center ipsGap:3 ipsGap_row:0 ipsType_medium ipsType_blendLinks'>\
			<div class='ipsFlex-flex:00'><img src='{{icon}}' alt='' class='ipsUserPhoto ipsUserPhoto_tiny'></div>\
			<div class='ipsFlex-flex:11 ipsType_left'>\
				{{text}}\
				<p class='ipsType_reset ipsType_light ipsTruncate ipsTruncate_line'>{{{body}}}</p>\
			</div>\
		</div>\
	</a>\
");

ips.templates.set('core.notification.flashMultiple', " \
	<div class='ipsFlex ipsFlex-ai:center ipsGap:3 ipsGap_row:0 ipsType_medium ipsType_blendLinks' data-role='newNotification'>\
		<span class='ipsFlex-flex:00 ipsType_veryLarge'><i class='fa fa-bell'></i></span>\
		<div class='ipsFlex-flex:11 ipsType_left'>\
			{{text}}\
			<p class='ipsType_reset ipsType_light ipsTruncate ipsTruncate_line'>{{{body}}}</p>\
		</div>\
	</div>\
");

/* ALERTS */
ips.templates.set('core.alert.box', " \
<div class='ipsAlert' style='display: none' role='alertdialog' aria-describedby='{{id}}_message'>\
	{{{icon}}}\
	<div class='ipsAlert_msg ipsType_break' id='{{id}}_message'>\
		<strong>{{{text}}}</strong>\
		{{{subtext}}}\
	</div>\
	<ul class='ipsToolList ipsToolList_horizontal ipsPos_center ipsAlert_buttonRow ipsClear ipsClearfix'>\
		{{{buttons}}}\
	</ul>\
</div>\
");

ips.templates.set('core.alert.subText', " \
<div class='ipsType_light ipsType_normal'>{{text}}</div>\
");

ips.templates.set('core.alert.subTextHtml', " \
<div class='ipsType_light ipsType_normal'>{{{text}}}</div>\
");

ips.templates.set('core.alert.icon', " \
<i class='{{icon}} ipsAlert_icon'></i>\
");

ips.templates.set('core.alert.button', " \
<li><button data-action='{{action}}' class='ipsButton ipsButton_fullWidth {{extra}}' role='button'>{{title}}</button></li>\
");

ips.templates.set('core.alert.prompt', " \
<br><br>\
<input type='text' value='{{value}}' class='ipsField_fullWidth' data-role='promptValue'>\
<br><br>\
");

/* LIGHTBOX TEMPLATES */
ips.templates.set('core.lightbox.meta', "{{title}}");

/* DIALOG TEMPLATES */
ips.templates.set('core.dialog.main', " \
<div class='{{class}} {{#fixed}}{{class}}_fixed{{/fixed}} {{#size}}{{class}}_{{size}}{{/size}} {{extraClass}}' style='display: none' id='{{id}}' role='dialog' aria-label='{{title}}'>\
	<div>\
		{{#title}}\
			<h3 class='{{class}}_title'>{{title}}</h3>\
			<hr class='ipsHr'>\
		{{/title}}\
		{{#close}}\
			<a href='#' class='{{class}}_close' data-action='dialogClose'>&times;</a>\
		{{/close}}\
		<div class='{{class}}_content'>\
			{{content}}\
		</div>\
		<div class='{{class}}_loading {{class}}_large ipsLoading ipsLoading_noAnim' style='display: none'></div>\
	</div>\
</div>\
")

/* TOOLTIP TEMPLATE */
ips.templates.set('core.tooltip', " \
	<div id='{{id}}' class='ipsTooltip ipsType_noBreak' role='tooltip'>{{content}}</div>\
");

/* SEARCH TEMPLATES */
ips.templates.set('core.search.loadingPanel', " \
	<div id='{{id}}' class='ipsLoading' style='min-height: 100px'>\
		&nbsp;\
	</div>\
");

/* EDITOR TEMPLATES */
ips.templates.set('core.editor.panelWrapper', " \
	<div id='{{id}}' class='ipsRTE_panel ipsPad'>\
		{{content}}\
	</div>\
");

ips.templates.set('core.editor.giphy', " \
<div class='ipsMenu ipsMenu_wide' id='{{id}}_menu' style='display: none' data-editorID='{{editor}}' data-controller='core.global.editor.giphy'>\
	<div class='ipsMenu_headerBar'>\
		<div class='ipsGiphy_attribution'><img src='{{attribution_image}}'></div>\
		<h4 class='ipsType_sectionHead'>\
			{{#lang}}giphy{{/lang}}\
		</h4>\
	</div>\
	<div class='ipsMenu_innerContent ipsGiphy_content' data-role='giphyResults'>\
		<div data-role='giphyLoading'>\
			\
		</div>\
		<div class='ipsGiphy_moar' data-role='giphyMore' data-offset='0'>\
			<div data-role='giphyMoreLoading' class='ipsType_light ipsHide ipsSpacer_bottom'>{{#lang}}giphyMore_loading{{/lang}}</div>\
		</div>\
	</div>\
	<div class='ipsMenu_footerBar'>\
		<input type='text' data-role='giphySearch' class='ipsField_fullWidth' placeholder='{{#lang}}giphyFind{{/lang}}'>\
	</div>\
</div>\
");

ips.templates.set('core.editor.giphyThumb', " \
	<div class='ipsGiphy_thumb'><img src=\"{{thumb}}\" class=\"ipsGiphyImage\" data-url=\"{{url}}\" alt='{{title}}' title='{{title}}'></div>\
");

ips.templates.set('core.editor.giphyRow', " \
	<div class='ipsGiphy_row'>{{{gifs}}}</div>\
");

ips.templates.set('core.editor.pixabayThumb', " \
	<div class='ipsPixabay_thumb'><img src=\"{{thumb}}\" class=\"ipsPixabayImage\" data-url=\"{{url}}\" data-id=\"{{imgid}}\"></div>\
");

ips.templates.set('core.editor.pixabayRow', " \
	<div class='ipsPixabay_row'>{{{images}}}</div>\
");

ips.templates.set('core.editor.emoticons', " \
<div class='ipsMenu ipsMenu_wide' id='{{id}}_menu' style='display: none' data-editorID='{{editor}}' data-controller='core.global.editor.emoticons'>\
	<div class='ipsMenu_headerBar'>\
		<p class='ipsType_reset ipsPos_right'>\
			<a href='#' class='ipsType_blendLinks ipsHide' data-role='skinToneMenu' data-ipsMenu data-ipsMenu-appendTo='#{{id}}_menu' id='{{id}}_tones'>{{#lang}}emoji_skin_tone{{/lang}} <i class='fa fa-caret-down'></i></a>\
			&nbsp;&nbsp;&nbsp;\
			<a href='#' class='ipsType_blendLinks ipsHide' data-role='categoryTrigger' data-ipsMenu data-ipsMenu-appendTo='#{{id}}_menu' id='{{id}}_more'>{{#lang}}emoticonCategories{{/lang}} <i class='fa fa-caret-down'></i></a>\
		</p>\
		<h4 class='ipsType_sectionHead'>{{#lang}}emoji{{/lang}}</h4>\
		<ul class='ipsMenu ipsMenu_veryNarrow ipsCursor_pointer' id='{{id}}_tones_menu' role='menu' style='display: none'>\
			<li class='ipsMenu_title'>{{#lang}}emoji_skin_tone{{/lang}}</li>\
			<li class='ipsMenu_item' role='menuitem' data-ipsMenuValue='none'><a>{{#lang}}emoji_skin_tone_default{{/lang}}</a></li>\
			<li class='ipsMenu_sep'><hr></li>\
			<li class='ipsMenu_item' role='menuitem' data-ipsMenuValue='light'><a>\uD83C\uDFFB {{#lang}}emoji_skin_tone_light{{/lang}}</a></li>\
			<li class='ipsMenu_item' role='menuitem' data-ipsMenuValue='medium-light'><a>\uD83C\uDFFC {{#lang}}emoji_skin_tone_medium_light{{/lang}}</a></li>\
			<li class='ipsMenu_item' role='menuitem' data-ipsMenuValue='medium'><a>\uD83C\uDFFD {{#lang}}emoji_skin_tone_medium{{/lang}}</a></li>\
			<li class='ipsMenu_item' role='menuitem' data-ipsMenuValue='medium-dark'><a>\uD83C\uDFFE {{#lang}}emoji_skin_tone_medium_dark{{/lang}}</a></li>\
			<li class='ipsMenu_item' role='menuitem' data-ipsMenuValue='dark'><a>\uD83C\uDFFF {{#lang}}emoji_skin_tone_dark{{/lang}}</a></li>\
		</ul>\
		<ul data-role='categoryMenu' class='ipsMenu ipsMenu_auto ipsCursor_pointer' id='{{id}}_more_menu' role='menu' style='display: none'>\
		</ul>\
	</div>\
	<div class='ipsMenu_innerContent ipsEmoticons_content'>\
		<div class='ipsEmpty ipsType_center ipsEmoticons_contentLoading' data-role='emojiLoading'>\
			{{#lang}}loading{{/lang}}...\
		</div>\
	</div>\
	<div class='ipsMenu_footerBar'>\
		<input type='text' data-role='emoticonSearch' class='ipsField_fullWidth' placeholder='{{#lang}}emoticonFind{{/lang}}'>\
	</div>\
</div>\
");		

ips.templates.set('core.editor.emoticonSection', " \
	<div data-panel='{{id}}'>{{{content}}}</div>\
");

ips.templates.set('core.editor.emoticonMenu', " \
	<li class='ipsMenu_item' role='menuitem' data-ipsMenuValue='{{categoryID}}'><a><span class='ipsMenu_itemCount'>{{count}}</span>{{title}}</a></li>\
");

ips.templates.set('core.editor.emoticonCategory', " \
	<div class='ipsAreaBackground_light ipsPad_half'><strong>{{title}}</strong></div>\
	<div class='ipsEmoticons_category' data-categoryid='{{categoryID}}'>{{{emoticons}}}</div>\
");
ips.templates.set('core.editor.emoticonSearch', " \
	<div class='ipsEmoticons_category'>{{{emoticons}}}</div>\
");

ips.templates.set('core.editor.emoticonRow', " \
	<div class='ipsEmoticons_row ipsEmoji'>{{{emoticons}}}</div>\
");

ips.templates.set('core.editor.emoticonItem', " \
	<div class='ipsEmoticons_item' data-emoticon='{{tag}}' data-src='{{src}}' data-srcset='{{srcset}}' data-height='{{height}}' data-width='{{width}}' title='{{tag}}'>{{{img}}}</div>\
");

ips.templates.set('core.editor.emoji', " \
	<div class='ipsEmoticons_item' title='{{name}}' data-emoji='{{code}}'>{{{display}}}</div>\
");

ips.templates.set('core.editor.emojiNotNative', " \
	<div class='ipsEmoticons_item' title='{{name}}' data-emoji='{{code}}'>{{{img}}}</div>\
");


ips.templates.set('core.editor.emoticonBlank', " \
	<div class='ipsEmoticons_item'>&nbsp;</div>\
");

ips.templates.set('core.editor.emoticonNoResults', " \
	<div class='ipsPad ipsType_center ipsType_light'>{{#lang}}no_results{{/lang}}</div>\
");

ips.templates.set('core.editor.emojiResult', " \
	<li class='ipsMenu_item ipsCursor_pointer' title='{{name}}' data-emoji='{{code}}'>\
		<a><span class='ipsEmoji_result'>{{{emoji}}}</span> <span data-role='shortCode'>{{short_code}}</span></a>\
	</li>\
");

ips.templates.set('core.editor.quote', "<blockquote class='ipsQuote' data-ipsQuote data-gramm='false'><div class='ipsQuote_citation'>{{citation}}</div><div class='ipsQuote_contents ipsClearfix' data-gramm='false'>{{{contents}}}</div></blockquote>");
ips.templates.set('core.editor.legacyQuoteUpcast', "<div class='ipsQuote_citation'>{{citation}}</div><div class='ipsQuote_contents ipsClearfix' data-gramm='false'>{{{contents}}}</div>");

ips.templates.set('core.editor.citation', " \
	<div class='ipsQuote_citation ipsQuote_open'>\
		<a href='#' data-action='toggleQuote'>&nbsp;</a>\
		{{#contenturl}}\
			<a class='ipsPos_right' href='{{contenturl}}'><i class='fa fa-share'></i></a>\
		{{/contenturl}}\
		{{{citation}}}\
	</div>\
");

ips.templates.set('core.editor.citationLink', " \
	<a href='{{baseURL}}?app=core&module=members&controller=profile&id={{userid}}' data-ipsHover data-ipshover-target='{{baseURL}}?app=core&module=members&controller=profile&id={{userid}}&do=hovercard'>{{username}}</a>\
");

ips.templates.set('core.editor.spoiler', "<div class='ipsSpoiler' data-ipsSpoiler><div class='ipsSpoiler_header'><span>{{#lang}}editorSpoiler{{/lang}}</span></div><div class='ipsSpoiler_contents ipsClearfix'></div></div>");
ips.templates.set('core.editor.legacySpoilerUpcast', "<div class='ipsSpoiler_header'><span>{{#lang}}editorSpoiler{{/lang}}</span></div><div class='ipsSpoiler_contents ipsClearfix' data-gramm='false'>{{{contents}}}</div>");
ips.templates.set('core.editor.spoilerHeader', " \
	<div class='ipsSpoiler_header ipsSpoiler_closed'>\
		<a href='#' data-action='toggleSpoiler'>&nbsp;</a>\
		<span>{{#lang}}spoilerClickToReveal{{/lang}}</span>\
	</div>\
");

ips.templates.set('core.editor.initLoading', " \
	<div class='ipsLoading ipsLoading_tiny'>&nbsp;</div>\
");

ips.templates.set('core.editor.previewLoading', " \
	<div data-role='previewLoading' class='ipsLoading' style='min-height: 100px'>\
		&nbsp;\
	</div>\
");

/* ATTACHMENT TEMPLATES */
ips.templates.set('core.attachments.metaInfo', " \
	{{size}} &middot; {{downloads}} \
");

ips.templates.set('core.attachments.attachmentPreview', " \
	<span class='ipsAttachLink_title'>{{title}}</span><span class='ipsAttachLink_metaInfo'>{{#lang}}attachmentPending{{/lang}}</span> \
");

ips.templates.set('core.attachments.fileItemWrapper', " \
	<ul class='ipsDataList'>{{{content}}}</ul>\
");

ips.templates.set('core.attachments.fileItem', " \
	<div class='ipsDataItem ipsAttach ipsContained {{#done}}ipsAttach_done{{/done}}' id='{{id}}' data-role='file' data-fileid='{{id}}' data-filesize='{{sizeRaw}}'>\
		<div class='ipsDataItem_generic ipsDataItem_size1 ipsType_center' data-role='preview' data-action='insertFile' {{#thumb}}style='background-image: url( \"{{thumbnail}}\" )'{{/thumb}}>\
			{{#thumb}}\
				{{{thumb}}}\
			{{/thumb}}\
			<i class='fa fa-file ipsType_large' {{#thumb}}style='display: none'{{/thumb}}></i>\
		</div>\
		<div class='ipsDataItem_main' data-action='insertFile'>\
			<h2 class='ipsDataItem_title ipsType_medium ipsType_reset ipsAttach_title ipsTruncate ipsTruncate_line' data-role='title'>{{title}}</h2>\
			<p class='ipsDataItem_meta ipsType_light'>\
				{{size}}\
			</p>\
		</div>\
		<div class='ipsDataItem_generic ipsDataItem_size5'>\
			{{#status}}<span class='ipsAttachment_progress'><span data-role='progressbar'></span></span>{{/status}}\
			{{#statusText}}<span class='ipsType_light' data-role='status'>{{statusText}}</span>{{/statusText}}\
		</div>\
		<div class='ipsDataItem_generic ipsDataItem_size8 ipsType_right'>\
			<ul class='ipsList_inline'>\
				<li data-role='insert' {{#insertable}}style='display: none'{{/insertable}}>\
					<a href='#' data-action='insertFile' class='ipsAttach_selection' data-ipsTooltip title='{{#lang}}insertIntoPost{{/lang}}'>\
						<i class='fa fa-plus'></i>\
					</a>\
				</li>\
				{{#supportsDelete}}<li data-role='deleteFileWrapper' {{#newUpload}}style='display: none'{{/newUpload}}>\
					<input type='hidden' name='{{field_name}}_keep[{{id}}]' value='1'>\
					<a href='#' data-role='deleteFile' class='ipsType_warning' data-ipsTooltip title='{{#lang}}attachRemove{{/lang}}'>\
						<i class='fa fa-trash-o'></i> {{#lang}}delete{{/lang}}\
					</a>\
				</li>\
				{{/supportsDelete}}\
				{{^supportsDelete}}<li data-role='deleteFileWrapper' style='display: none'>\
					<input type='hidden' name='{{field_name}}_keep[{{id}}]' value='1'>\
					<a href='#' data-role='deleteFile'>&nbsp;</a>\
				</li>\
				{{/supportsDelete}}\
			</ul>\
		</div>\
	</div>\
");

ips.templates.set('core.attachments.imageItem', " \
	<div class='ipsGrid_span3 ipsAttach ipsImageAttach ipsPad_half ipsAreaBackground_light {{#done}}ipsAttach_done{{/done}}' id='{{id}}' data-role='file' data-fileid='{{id}}' data-fullsizeurl='{{imagesrc}}' data-thumbnailurl='{{thumbnail}}' data-fileType='image'>\
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
		<h2 class='ipsType_reset ipsAttach_title ipsType_medium ipsTruncate ipsTruncate_line' data-role='title'>{{title}}</h2>\
		<p class='ipsType_light'>{{size}} {{#statusText}}&middot; <span data-role='status'>{{statusText}}</span>{{/statusText}}</p>\
	</div>\
");

ips.templates.set('core.attachments.videoItem', " \
	<div class='ipsGrid_span3 ipsAttach ipsImageAttach ipsPad_half ipsAreaBackground_light {{#done}}ipsAttach_done{{/done}}' id='{{id}}' data-role='file' data-fileid='{{id}}' data-fullsizeurl='{{imagesrc}}' data-thumbnailurl='{{thumbnail}}' data-fileType='video' data-mimeType='{{mime}}'>\
		<ul class='ipsList_inline ipsImageAttach_controls'>\
			<li data-role='insert' {{#insertable}}style='display: none'{{/insertable}}><a href='#' data-action='insertFile' class='ipsAttach_selection' data-ipsTooltip title='{{#lang}}insertIntoPost{{/lang}}'><i class='fa fa-plus'></i></a></li>\
			</li>\
			<li class='ipsPos_right' {{#newUpload}}style='display: none'{{/newUpload}} data-role='deleteFileWrapper'>\
				<input type='hidden' name='{{field_name}}_keep[{{id}}]' value='1'>\
				<a href='#' data-role='deleteFile' class='ipsButton ipsButton_verySmall ipsButton_light' data-ipsTooltip title='{{#lang}}attachRemove{{/lang}}'><i class='fa fa-trash-o'></i></a>\
			</li>\
		</ul>\
		<div class='ipsImageAttach_thumb ipsType_center' data-role='preview' data-grid-ratio='65' data-action='insertFile'>\
			{{#status}}\
				<span class='ipsImageAttach_status ipsType_light' data-role='status'>{{{status}}}</span>\
				<span class='ipsAttachment_progress'><span data-role='progressbar'></span></span>\
			{{/status}}\
			{{#thumb}}\
				<video>\
					<source src='{{{thumb}}}' type='{{mime}}'>\
				</video>\
			{{/thumb}}\
		</div>\
		<h2 class='ipsType_reset ipsAttach_title ipsType_medium ipsTruncate ipsTruncate_line' data-role='title'>{{title}}</h2>\
		<p class='ipsType_light'>{{size}} {{#statusText}}&middot; <span data-role='status'>{{statusText}}</span>{{/statusText}}</p>\
	</div>\
");

ips.templates.set('core.attachments.imageItemWrapper', " \
	<div class='ipsGrid ipsGrid_collapsePhone' data-ipsGrid data-ipsGrid-minItemSize='150' data-ipsGrid-maxItemSize='250'>{{{content}}}</div>\
");

/* FORM TEMPLATES */
ips.templates.set('core.autocomplete.field', " \
	<div class='ipsField_autocomplete' id='{{id}}_wrapper' role='combobox' aria-autocomplete='list' aria-owns='{{id}}_results'>\
		<span class='ipsField_autocomplete_loading' style='display: none' id='{{id}}_loading'></span>\
		<ul class='ipsList_inline' role='listbox'><li id='{{id}}_inputItem' role='option'>{{content}}</li></ul>\
	</div>\
");

ips.templates.set('core.autocomplete.addToken', " \
	<a href='#' data-action='addToken'><i class='fa fa-plus'></i> {{text}}</a> \
");

ips.templates.set('core.autocomplete.resultWrapper', " \
	<div class='ipsAutocompleteMenu' id='{{id}}_results' aria-expanded='false' style='display: none'>\
		<ul class='ipsAutocompleteMenu_itemWrapper ipsList_reset' role='listbox' aria-expanded='false' data-role='items'></ul>\
	</div>\
");

ips.templates.set('core.autocomplete.searchTypeAhead', " \
	<div class='ipsPad_half ipsAreaBackground' data-role='autocompleteSearch'>\
		<div class='ipsClearfix'>\
			<input type='search' name='autocompleteSearch' placeholder='{{#lang}}autocomplete_search_placeholder{{/lang}}'>\
		</div>\
	</div>\
");

ips.templates.set('core.autocomplete.resultItem', " \
	<li class='ipsAutocompleteMenu_item' data-value='{{value}}' role='option'>\
		<div class='ipsClearfix'>\
			{{html}}\
		</div>\
	</li>\
");

ips.templates.set('core.autocomplete.tagsResultItem', " \
	<li class='ipsAutocompleteMenu_item' data-value='{{value}}' role='option'>\
		<div class='ipsClearfix'>\
			{{html}}\
			{{#recommended}}\
				<span class='ipsPos_right ipsType_success'>{{#lang}}tag_recommended{{/lang}}\
			{{/recommended}}\
		</div>\
	</li>\
");

ips.templates.set('core.autocomplete.token', " \
	<li class='cToken' data-value='{{value}}' role='option'>\
		{{{title}}} <span class='cToken_close' data-action='delete'>&times;</span>\
	</li>\
");

ips.templates.set('core.autocomplete.memberItem', " \
	<li class='ipsAutocompleteMenu_item ipsClearfix' data-value=\"{{value}}\" role='option'>\
		<div class='ipsPhotoPanel ipsPhotoPanel_tiny'>\
			<span class='ipsUserPhoto ipsUserPhoto_tiny'><img src='{{{photo}}}'></span>\
			<div>\
				<strong>{{{name}}}</strong><br>\
				<span class='ipsType_light'>{{{extra}}}</span>\
			</div>\
		</div>\
	</li>\
");

ips.templates.set('core.autocomplete.optional', " \
	<a href='#' data-action='showAutocomplete' class='ipsButton ipsButton_light ipsButton_verySmall'>{{langString}}...</a>\
");

ips.templates.set('core.forms.toggle', " \
	<span class='ipsToggle {{className}}' id='{{id}}' tabindex='0' role='switch' aria-checked='{{status}}'>\
		<span data-role='status'></span>\
	</span>\
");

ips.templates.set('core.forms.validationWrapper', " \
	<ul id='{{id}}' class='ipsList_reset ipsType_small ipsForm_errorList'>{{content}}</ul>\
");

ips.templates.set('core.forms.validationItem', " \
	<li class='ipsType_warning'>{{message}}</li>\
");

ips.templates.set('core.forms.advicePopup', "\
<div class='ipsHovercard' data-role='advicePopup' id='elPasswordAdvice_{{id}}'>\
	<div class='ipsPad'>\
		<h2 class='ipsType_sectionHead'>{{#lang}}password_advice_title{{/lang}}</h2>\
		<p class='ipsSpacer_top ipsSpacer_half ipsType_reset ipsType_medium'>\
			{{#min}}\
				{{min}} \
			{{/min}}\
			{{{text}}}\
		</p>\
	</div>\
	<span class='ipsHovercard_stem'></span>\
</div>\
");

ips.templates.set('core.forms.validateOk', "\
<span>\
	<i class='fa fa-check-circle ipsType_success'></i>\
</span>\
");

ips.templates.set('core.forms.validateFail', "\
<span data-ipsTooltip data-ipsTooltip-label='{{message}}'>\
	<i class='fa fa-times-circle ipsType_warning'></i>\
</span>\
");

ips.templates.set('core.forms.validateFailText', "\
<p class='ipsType_reset ipsSpacer_top ipsSpacer_half ipsType_warning'>\
	<i class='fa fa-times-circle'></i> {{message}}\
</p>\
");

/* TRUNCATE TEMPLATE */
ips.templates.set('core.truncate.expand', " \
	<a class='ipsTruncate_more' data-action='expandTruncate'><span>{{text}} &nbsp;<i class='fa fa-caret-down'></i></span></a>\
");

/* NODE SELECT */
ips.templates.set('core.selectTree.token', " \
<li><span class='ipsSelectTree_token cToken' data-nodeID='{{id}}'>{{title}}</span></li>\
");

/* ACCESSIBILITY KEYBOARD NAV TEMPLATES */
ips.templates.set('core.accessibility.border', " \
<div id='ipsAccessibility_border'></div>\
");

ips.templates.set('core.accessibility.arrow', " \
<div id='ipsAccessibility_arrow'></div>\
");

/* INFINITE SCROLL */
ips.templates.set('core.infScroll.loading', " \
	<li class='ipsPad ipsType_center' data-role='infScroll_loading'>\
		{{#lang}}loading{{/lang}}...\
	</li>\
");

ips.templates.set('core.infScroll.pageBreak', " \
	<li class='ipsPad_half ipsAreaBackground' data-role='infScroll_break' data-infScrollPage='{{page}}'>\
		{{#lang}}page{{/lang}} {{page}}\
	</li>\
");

ips.templates.set('core.pageAction.actionMenuItem', " \
	<li data-role='actionMenu' data-action='{{action}}' id='{{id}}_{{action}}' data-ipsMenu data-ipsMenu-above='force' data-ipsMenu-appendTo='#{{id}}_bar' data-ipsMenu-activeClass='ipsPageAction_active' data-ipsTooltip title='{{title}}' class='ipsHide'>\
		{{#icon}}\
			<i class='fa fa-{{icon}} ipsPageAction_icon'></i> <i class='fa fa-caret-up'></i>\
		{{/icon}}\
		{{^icon}}\
			<span class='ipsPageAction_text'>{{title}} <i class='fa fa-caret-up'></i></span>\
		{{/icon}}\
		<ul id='{{id}}_{{action}}_menu' class='ipsMenu ipsMenu_auto' style='display: none'>\
			{{{menucontent}}}\
		</ul>\
	</li>\
");

ips.templates.set('core.pageAction.actionItem', " \
	<li data-role='actionButton' data-action='{{action}}' id='{{id}}_{{action}}' data-ipsTooltip title='{{title}}'>\
		{{#icon}}\
			<i class='fa fa-{{icon}} ipsPageAction_icon' data-ipsTooltip='{{title}}'></i></i>\
		{{/icon}}\
		{{^icon}}\
			<span class='ipsPageAction_text'>{{title}}</span>\
		{{/icon}}\
	</li>\
");

/* PAGE ACTIONS */
ips.templates.set('core.pageAction.wrapper', " \
	<div class='ipsPageAction' data-role='actionBar' id='{{id}}_bar'>\
		<ul class='ipsList_inline ipsList_reset' data-role='actionItems'>\
			<li>{{{selectedLang}}}</li>\
			{{{content}}}\
		</ul>\
	</div>\
");

/* CAROUSEL */
ips.templates.set('core.carousel.bulletWrapper', "\
	<ul class='ipsCarousel_bullets'>{{content}}</ul>\
");

ips.templates.set('core.carousel.bulletItem', "\
	<li><i class='fa fa-circle'></i></li>\
");

/* RATINGS */
ips.templates.set('core.rating.wrapper', "\
	<div class='ipsClearfix ipsRating'>\
		<ul class='{{className}}' data-role='ratingList'>\
			{{{content}}}\
		</ul>\
	</div>\
	<span data-role='ratingStatus' class='ipsType_light ipsType_medium'>{{status}}</span>\
")

ips.templates.set('core.rating.star', "\
	<li class='{{className}}' data-ratingValue='{{value}}'><a href='#'><i class='fa fa-star'></i></a></li>\
");

ips.templates.set('core.rating.halfStar', "\
	<li class='ipsRating_half' data-ratingValue='{{value}}'><i class='fa fa-star-half'></i><i class='fa fa-star-half fa-flip-horizontal'></i></li>\
");

ips.templates.set('core.rating.loading', "\
	<i class='icon-spinner2 ipsLoading_tinyIcon'></span>\
");

/* SIDEBAR MANAGER */
ips.templates.set('core.sidebar.managerWrapper', " \
	<div id='elSidebarManager' data-role='manager' class='ipsToolbox ipsScrollbar ipsHide'>\
		<div class='ipsPad'>\
			<h3 class='ipsToolbox_title ipsType_reset'>{{#lang}}sidebarManager{{/lang}}</h3>\
			<p class='ipsType_light'>{{#lang}}sidebarManagerDesc{{/lang}}</p>\
			<p class='ipsType_light'>{{#lang}}sidebarManagerDesc2{{/lang}}</p>\
			<div data-role='availableBlocks' class='ipsLoading ipsLoading_dark'></div>\
		</div>\
		<div id='elSidebarManager_submit' class='ipsPad'>\
			<button class='ipsButton ipsButton_important ipsButton_medium ipsButton_fullWidth' data-action='closeSidebar'>{{#lang}}finishEditing{{/lang}}</button>\
		</div>\
	</div>\
");

ips.templates.set('core.sidebar.blockManage', " \
	<div class='cSidebarBlock_managing ipsType_center'>\
		<h4>{{title}}</h4>\
		<a href='#' data-action='removeBlock' data-ipsTooltip title='{{#lang}}removeBlock{{/lang}}'><i class='fa fa-times'></i></a>\
		<button	data-ipsMenu data-ipsMenu-closeOnClick='false' id='{{id}}_edit' data-action='manageBlock' class='ipsButton ipsButton_primary'>\
			<i class='fa fa-pencil'></i> &nbsp;{{#lang}}editBlock{{/lang}}\
		</button>\
		<div class='ipsMenu ipsMenu_wide ipsHide' id='{{id}}_edit_menu'>\
		</div>\
	</div>\
");

ips.templates.set('core.sidebar.blockManageNoConfig', " \
	<div class='cSidebarBlock_managing ipsType_center'>\
		<h4>{{title}}</h4>\
		<a href='#' data-action='removeBlock' data-ipsTooltip title='{{#lang}}removeBlock{{/lang}}'><i class='fa fa-times'></i></a>\
	</div>\
");

ips.templates.set('core.sidebar.blockIsEmpty', " \
	<div class='ipsWidgetBlank ipsPad'>\
		{{text}}\
	</div>\
");

/* FOLLOW BUTTON LOADING */
ips.templates.set('core.follow.loading', " \
<div class='ipsLoading ipsLoading_tiny'></div>\
");

/* STATUS TEMPLATES */
ips.templates.set('core.statuses.loadingComments', " \
	<i class='icon-spinner2 ipsLoading_tinyIcon'></i> &nbsp;<span class='ipsType_light'> &nbsp;{{#lang}}loadingComments{{/lang}}</span>\
");


/* STACKS */
ips.templates.set('core.forms.stack', " \
	<li class='ipsField_stackItem' data-role='stackItem'>\
		<span class='ipsField_stackDrag ipsDrag' data-action='stackDrag'>\
			<i class='fa fa-bars ipsDrag_dragHandle'></i>\
		</span>\
		<a href='#' class='ipsField_stackDelete ipsCursor_pointer' data-action='stackDelete'>\
			&times;\
		</a>\
		<div data-ipsStack-wrapper>\
			{{{field}}}\
		</div>\
	</li>\
");

/* POLLS */
ips.templates.set('core.pollEditor.question', " \
	<div class='ipsAreaBackground_light ipsBox ipsBox_transparent' data-role='question' data-questionID='{{questionID}}'>\
		<div class='ipsAreaBackground ipsPad'>\
			<input type='text' data-role='questionTitle' name='{{pollName}}[questions][{{questionID}}][title]' placeholder='{{#lang}}questionPlaceholder{{/lang}}' class='ipsField_fullWidth' value='{{question}}'>\
		</div>\
		<div>\
			<ul class='ipsDataList cPollChoices' data-role='choices'>\
				<li class='ipsDataItem ipsResponsive_hidePhone'>\
					<p class='ipsDataItem_generic ipsDataItem_size1'>&nbsp;</p>\
					<p class='ipsDataItem_main'><strong>{{#lang}}choicesTitle{{/lang}}</strong></p>\
					{{#showCounts}}\
						<p class='ipsDataItem_generic ipsDataItem_size4'><strong>{{#lang}}votesTitle{{/lang}}</strong></p>\
					{{/showCounts}}\
					<p class='ipsDataItem_generic ipsDataItem_size1'>&nbsp;</p>\
				</li>\
				{{{choices}}}\
			</ul>\
			<br>\
			<div class='ipsDataList'>\
				<p class='ipsDataItem_generic ipsDataItem_size1'>&nbsp;</p>\
				<ul class='ipsDataItem_main ipsList_inline ipsPadding_right:half'>\
					{{#removeQuestion}}<li class='ipsPos_right'><a href='#' data-action='removeQuestion' class='ipsButton ipsButton_verySmall ipsButton_link ipsButton_link--negative'>{{#lang}}removeQuestion{{/lang}}</a></li>{{/removeQuestion}}\
					<li><a href='#' data-action='addChoice' class='ipsButton ipsButton_verySmall ipsButton_link'>{{#lang}}addChoice{{/lang}}</a></li>\
					<li>\
						<span class='ipsCustomInput'>\
							<input type='checkbox' id='elPoll_{{pollName}}_{{questionID}}multi' name='{{pollName}}[questions][{{questionID}}][multichoice]' {{#multiChoice}}checked{{/multiChoice}}>\
							<span></span>\
						</span> <label for='elPoll_{{pollName}}_{{questionID}}multi'>{{#lang}}multipleChoiceQuestion{{/lang}}</label></li>\
					</li>\
				</ul>\
			</div>\
		</div>\
	</div>\
");

ips.templates.set('core.pollEditor.choice', " \
	<li class='ipsDataItem' data-choiceID='{{choiceID}}'>\
		<div class='ipsDataItem_generic ipsDataItem_size1 cPollChoiceNumber ipsType_right ipsType_normal'>\
			<strong data-role='choiceNumber'>{{choiceID}}</strong>\
		</div>\
		<div class='ipsDataItem_main'>\
			<input type='text' name='{{pollName}}[questions][{{questionID}}][answers][{{choiceID}}][value]' value='{{choiceTitle}}' class='ipsField_fullWidth'>\
		</div>\
		{{#showCounts}}\
			<div class='ipsDataItem_generic ipsDataItem_size4' data-voteText='{{#lang}}votesTitle{{/lang}}'>\
				<input type='number' name='{{pollName}}[questions][{{questionID}}][answers][{{choiceID}}][count]' value='{{count}}' min='0'>\
			</div>\
		{{/showCounts}}\
		<div class='ipsDataItem_generic ipsDataItem_size1'>\
			<a href='#' data-action='removeChoice' class='ipsButton ipsButton_verySmall ipsButton_link ipsButton_link--negative ipsButton_narrow'><i class='fa fa-times'></i></a>\
		</div>\
	</li>\
");

/* COVER PHOTOS */
ips.templates.set('core.coverPhoto.controls', " \
	<ul class='ipsList_reset ipsFlex ipsFlex-ai:center ipsGap:1' data-role='coverPhotoControls'>\
		<li><a href='#' class='ipsButton ipsButton_overlaid ipsButton_small' data-action='cancelPosition'><i class='fa fa-times'></i> {{#lang}}cancel{{/lang}}</a></li>\
		<li><a href='#' class='ipsButton ipsButton_veryLight ipsButton_small' data-action='savePosition'><i class='fa fa-check'></i> {{#lang}}save_position{{/lang}}</a></li>\
	</ul>\
");

/* PATCHWORK */
ips.templates.set('core.patchwork.imageList', " \
	{{#showThumb}}\
		<li class='cGalleryPatchwork_item' style='width: {{dims.width}}px; height: {{dims.height}}px; margin: {{dims.margin}}px {{dims.marginRight}}px {{dims.margin}}px {{dims.marginLeft}}px'>\
	{{/showThumb}}\
	{{^showThumb}}\
		<li class='cGalleryPatchwork_item ipsNoThumb ipsNoThumb_video' style='width: {{dims.width}}px; height: {{dims.height}}px; margin: {{dims.margin}}px {{dims.marginRight}}px {{dims.margin}}px {{dims.marginLeft}}px'>\
	{{/showThumb}}\
		<a href='{{image.url}}'>\
			{{#showThumb}}<img src='{{image.src}}' alt='{{image.title}}' class='cGalleryPatchwork_image'>{{/showThumb}}\
			<div class='ipsPhotoPanel ipsPhotoPanel_mini'>\
				<img src='{{image.author.photo}}' class='ipsUserPhoto ipsUserPhoto_mini'>\
				<div>\
					<span class='ipsType_normal ipsTruncate ipsTruncate_line'>{{image.caption}}</span>\
					<span class='ipsType_small ipsTruncate ipsTruncate_line'>{{#lang}}by{{/lang}} {{image.author.name}}</span>\
				</div>\
			</div>\
			<ul class='ipsList_inline cGalleryPatchwork_stats'>\
				{{#image.unread}}\
					<li class='ipsPos_left'>\
						<span class='ipsItemStatus ipsItemStatus_small' data-ipsTooltip title='{{image.unread}}'><i class='fa fa-circle'></i></span>\
					</li>\
				{{/image.unread}}\
				{{#image.hasState}}\
					<li class='ipsPos_left'>\
						{{#image.state.hidden}}\
							<span class='ipsBadge ipsBadge_icon ipsBadge_small ipsBadge_warning' data-ipsTooltip title='{{#lang}}hidden{{/lang}}'><i class='fa fa-eye-slash'></i></span>\
						{{/image.state.hidden}}\
						{{#image.state.pending}}\
							<span class='ipsBadge ipsBadge_icon ipsBadge_small ipsBadge_warning' data-ipsTooltip title='{{#lang}}pending{{/lang}}'><i class='fa fa-warning'></i></span>\
						{{/image.state.pending}}\
						{{#image.state.pinned}}\
							<span class='ipsBadge ipsBadge_icon ipsBadge_small ipsBadge_positive' data-ipsTooltip title='{{#lang}}pinned{{/lang}}'><i class='fa fa-thumb-tack'></i></span>\
						{{/image.state.pinned}}\
						{{#image.state.featured}}\
							<span class='ipsBadge ipsBadge_icon ipsBadge_small ipsBadge_positive' data-ipsTooltip title='{{#lang}}featured{{/lang}}'><i class='fa fa-star'></i></span>\
						{{/image.state.featured}}\
					</li>\
				{{/image.hasState}}\
				{{#image.allowComments}}\
					<li class='ipsPos_right' data-commentCount='{{image.comments}}'><i class='fa fa-comment'></i> {{image.comments}}</li>\
				{{/image.allowComments}}\
			</ul>\
		</a>\
		{{#image.modActions}}\
			<input type='checkbox' data-role='moderation' name='moderate[{{image.id}}]' data-actions='{{image.modActions}}' data-state='{{image.modStates}}'>\
		{{/image.modActions}}\
	</li>\
");

/* Editor preference */
ips.templates.set('core.editor.preferences', " \
	<div id='editorPreferencesPanel' class='ipsPad'>\
		<div class='ipsMessage ipsMessage_info'> \
			{{#lang}}papt_warning{{/lang}} \
		</div> \
		<br> \
		<ul class='ipsForm ipsForm_vertical'> \
			<li class='ipsFieldRow ipsClearfix'> \
				<div class='ipsFieldRow_content'> \
					<input type='checkbox' {{#checked}}checked{{/checked}} name='papt' id='papt'> \
					<label for='papt'>{{#lang}}papt_label{{/lang}}</label> \
				</div> \
			</li> \
		</ul> \
		<div class='ipsPadding_top:half ipsType_center'> \
			<button role='button' class='ipsButton ipsButton_medium ipsButton_primary' id='papt_submit'>{{#lang}}save_preference{{/lang}}</button> \
		</div> \
	</div> \
");

/* Pagination */
ips.templates.set('core.pagination', " \
	<ul class='ipsPagination' data-ipsPagination data-ipsPagination-pages='{{pages}}'>\
		<li class='ipsPagination_prev'>\
			<a href='#' data-page='prev'><i class='fa fa-caret-left'></i> {{#lang}}prev_page{{/lang}}</a>\
		</li>\
		<li class='ipsPagination_next'>\
			<a href='#' data-page='next'>{{#lang}}next_page{{/lang}} <i class='fa fa-caret-right'></i></a>\
		</li>\
	</ul>\
");

/* selective quoting */
ips.templates.set('core.selection.quote', " \
	<div class='ipsTooltip ipsTooltip_{{direction}} ipsComment_inlineQuoteTooltip' data-role='inlineQuoteTooltip'>\
	    <a href='#' data-action='quoteSelection' class='ipsButton ipsButton_veryVerySmall ipsButton_veryLight'>\
			{{#lang}}quote_selected_text{{/lang}}\
	    </a>\
    </div>\
");

/* Content item selector */
ips.templates.set('core.contentItem.resultItem', " \
	<li class='ipsAutocompleteMenu_item' data-id='{{{id}}}' role='option' role='listitem'>\
		<div class='ipsClearfix'>\
			{{{html}}}\
		</div>\
	</li>\
");

ips.templates.set('core.contentItem.field', " \
	<div class='ipsField_autocomplete' id='{{id}}_wrapper' role='combobox' aria-autocomplete='list' aria-owns='{{id}}_results'>\
		<span class='ipsField_autocomplete_loading' style='display: none' id='{{id}}_loading'></span>\
		<ul class='ipsList_inline'><li id='{{id}}_inputItem'>{{content}}</li></ul>\
	</div>\
");

ips.templates.set('core.contentItem.resultWrapper', " \
	<div class='ipsAutocompleteMenu' id='{{id}}_results' aria-expanded='false' style='display: none'>\
		<ul class='ipsAutocompleteMenu_itemWrapper ipsList_reset' data-role='items'></ul>\
	</div>\
");

ips.templates.set('core.contentItem.item', " \
	<li data-id='{{id}}'>\
		<span class='cContentItem_delete' data-action='delete'>&times;</span> {{{html}}} \
	</li>\
");

/* PROMOTES */
ips.templates.set('promote.imageUpload', " \
	<div class='ipsGrid_span4 cPromote_attachImage' id='{{id}}' data-role='file' data-fileid='{{id}}' data-fullsizeurl='{{imagesrc}}' data-thumbnailurl='{{thumbnail}}' data-fileType='image'>\
		<div class='ipsThumb ipsThumb_bg' data-role='preview' {{#thumbnail}}style='background-image: url( \"{{thumbnail_for_css}}\" )'{{/thumbnail}}>\
			{{#thumbnail}}<img src='{{thumbnail}}' class='ipsImage'>{{/thumbnail}}\
		</div>\
		<ul class='ipsList_inline ipsImageAttach_controls'>\
			<li class='ipsPos_right' {{#newUpload}}style='display: none'{{/newUpload}} data-role='deleteFileWrapper'>\
				<input type='hidden' name='{{field_name}}_keep[{{id}}]' value='1'>\
				<a href='#' data-role='deleteFile' class='ipsButton ipsButton_verySmall ipsButton_light' data-ipsTooltip title='{{#lang}}attachRemove{{/lang}}'><i class='fa fa-trash-o'></i></a>\
			</li>\
		</ul>\
		<span class='ipsAttachment_progress'><span data-role='progressbar'></span></span>\
	</div>\
");

/* TABLE ROW LOADING */
ips.templates.set('table.row.loading', " \
	<li class='ipsDataItem ipsDataItem_loading'>\
		<div>\
			<span></span>\
			<span style='margin-right: {{rnd}}%'></span>\
		</div>\
	</li>\
");

/* LICENSE RENEWAL */
ips.templates.set('licenseRenewal.wrapper', " \
	<div class='acpLicenseRenewal' data-role='licenseRenewal'>\
		<div class='acpLicenseRenewal_wrap'>\
			<div class='acpLicenseRenewal_inner'>\
				<div class='acpLicenseRenewal_content'>\
					<h1 class='acpLicenseRenewal_mainTitle' data-role='mainTitle'>{{#lang}}licenseRenewalTitle{{/lang}}</h1>\
					<p class='ipsType_normal'>{{#lang}}licenseRenewalText{{/lang}}</p>\
					<span class='ipsCustomInput'><input type='checkbox' checked='checked' name='hideRenewalNotice' id='hideRenewalNotice'><span></span></span> <label for='hideRenewalNotice'>{{#lang}}licenseRenewalCheckbox{{/lang}}</label>\
				</div>\
				<ul class='ipsPad ipsToolList ipsToolList_horizontal ipsPos_center ipsList_reset ipsClearfix ipsAreaBackground'>\
					<li>\
						<a href='#' class='ipsButton ipsButton_medium ipsButton_veryLight ipsButton_fullWidth' data-action='closeLicenseRenewal'>{{#lang}}licenseRenewalNo{{/lang}}</a>\
					</li>\
					<li>\
						<a href='#' class='ipsButton ipsButton_medium ipsButton_primary ipsButton_fullWidth' data-role='survey' data-action='closeLicenseRenewal' target='_blank'>{{#lang}}licenseRenewalYes{{/lang}}</a>\
					</li>\
				</ul>\
			</div>\
		</div>\
	</div>\
");

/* Browser Notifications Notices */
ips.templates.set( 'core.browserNotification.prompt' , "\
	<div class='cNotifcationPrompt'>\
		<div class='ipsPad'>\
			<div class='ipsPhotoPanel ipsPhotoPanel_mini'>\
				<span class='cNotifcationPrompt_icon ipsPos_left'></span>\
				<div>\
					<a href='#' class='cNotifcationPrompt_dismiss' data-role=\"dismissNotification\">×</a>\
					<h3 class='cNotifcationPrompt_title ipsType_large ipsType_sectionHead'>{{#lang}}notificationsCallout{{/lang}}</h3>\
					<p class='cNotifcationPrompt_text ipsType_reset ipsType_medium ipsSpacer_top ipsSpacer_half'>\
						{{#lang}}notificationsDefaultBlurb{{/lang}}\
					</p>\
					<button data-action='browserNotificationPrompt' class='ipsButton ipsButton_veryLight ipsButton_fullWidth ipsSpacer_top'>{{#lang}}notificationsAllow{{/lang}}</button>\
					<p class='ipsType_small ipsSpacer_both ipsSpacer_half ipsHide' data-role='promptMessage'>\
						{{#lang}}notificationsAllowPrompt{{/lang}}\
					</p>\
				</div>\
			</div>\
		</div>\
	</div>\
");

/* Warning form pre-set action list */
ips.templates.set('system.warningpenalty.nomodify', "\
	<ul class='ipsList_bullets' id='elWarningPenalties'>\
		{{#penalties}}\
		<li>{{.}}</li>\
		{{/penalties}}\
	</ul>\
");

ips.templates.set('core.edittags.default', "\
	<div class='ipsPad'>\
		<span><i class='icon-spinner2 ipsLoading_tinyIcon'></i>  &nbsp;{{#lang}}loading{{/lang}}</span>\
	</div>\
");