ips.templates.set('gallery.patchwork.indexItem', " \
	{{#showThumb}}\
		<span class='cGalleryPatchwork_item' style='width: {{dims.width}}px; height: {{dims.height}}px; margin: {{dims.margin}}px {{dims.marginRight}}px {{dims.margin}}px {{dims.marginLeft}}px'>\
	{{/showThumb}}\
	{{^showThumb}}\
		<span class='cGalleryPatchwork_item ipsNoThumb ipsNoThumb_video' style='width: {{dims.width}}px; height: {{dims.height}}px; margin: {{dims.margin}}px {{dims.marginRight}}px {{dims.margin}}px {{dims.marginLeft}}px'>\
	{{/showThumb}}\
			<a data-imageLightbox title='{{image.caption}}' href='{{image.url}}'>\
				{{#showThumb}}\
					{{#lazyLoad}}\
						<img src='{{blankImg}}' data-src='{{image.src}}' data-ratio='{{dims.ratio}}' alt='{{image.caption}}' class='cGalleryPatchwork_image'>\
					{{/lazyLoad}}\
					{{^lazyLoad}}\
						<img src='{{image.src}}' data-ratio='{{dims.ratio}}' alt='{{image.caption}}' class='cGalleryPatchwork_image'>\
					{{/lazyLoad}}\
				{{/showThumb}}\
				<div class='ipsPhotoPanel ipsPhotoPanel_mini'>\
					<img src='{{image.author.photo}}' class='ipsUserPhoto ipsUserPhoto_mini'>\
					<div>\
						<span class='ipsType_normal ipsTruncate ipsTruncate_line'>{{#lang}}by{{/lang}} {{image.author.name}}</span>\
						<span class='ipsType_small ipsTruncate ipsTruncate_line'>{{#lang}}in{{/lang}} {{image.container}}</span>\
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
		</span>\
");

ips.templates.set('gallery.patchwork.tableItem', " \
	{{#showThumb}}\
		<div data-imageID='{{image.id}}' class='cGalleryPatchwork_item' style='width: {{dims.width}}px; height: {{dims.height}}px; margin: {{dims.margin}}px {{dims.marginRight}}px {{dims.margin}}px {{dims.marginLeft}}px'>\
	{{/showThumb}}\
	{{^showThumb}}\
		<div data-imageID='{{image.id}}' class='cGalleryPatchwork_item ipsNoThumb ipsNoThumb_video' style='width: {{dims.width}}px; height: {{dims.height}}px; margin: {{dims.margin}}px {{dims.marginRight}}px {{dims.margin}}px {{dims.marginLeft}}px'>\
	{{/showThumb}}\
		<a data-imageLightbox title='{{image.caption}}' href='{{image.url}}'>\
			{{#showThumb}}\
				{{#lazyLoad}}\
					<img src='{{blankImg}}' data-src='{{image.src}}' data-ratio='{{dims.ratio}}' alt='{{image.caption}}' class='cGalleryPatchwork_image'>\
				{{/lazyLoad}}\
				{{^lazyLoad}}\
					<img src='{{image.src}}' data-ratio='{{dims.ratio}}' alt='{{image.caption}}' class='cGalleryPatchwork_image'>\
				{{/lazyLoad}}\
			{{/showThumb}}\
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
	</div>\
");

ips.templates.set('gallery.lightbox.wrapper', " \
	<div id='cLightbox' class='ipsModal' data-originalUrl='{{originalUrl}}' data-originalTitle='{{originalTitle}}'>\
		<span class='cLightboxClose'>&times;</span>\
		<div class='cLightboxBack'></div>\
	</div>\
");