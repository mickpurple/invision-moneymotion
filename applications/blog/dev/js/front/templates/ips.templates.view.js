/* CLASS LIST TEMPLATES */
ips.templates.set('blog.view.addButton', "\
<button type=\"button\" class=\"ipsButton ipsButton_primary ipsHide\" data-action=\"addNew\">{{#lang}}manage_cats_new_row{{/lang}}</button>\
");

ips.templates.set('blog.view.categoryRow', "\
<li class=\"ipsDataItem ipsClearfix\" itemprop=\"itemListElement\" data-category-id=\"{{cat}}\">\
	<div class=\"ipsDataItem_main\">\
		<span data-role=\"sortHandle\" class=\"ipsCursor_drag\"><i class=\"fa fa-bars\"></i></span>&nbsp;\
		<span class=\"ipsDataItem_title\" data-role=\"title_{{cat}}\">{{name}}</span>\
		<input type=\"text\" name=\"blog_name_{{cat}}\" value=\"\" data-role=\"input_{{cat}}\" class=\"ipsHide\">\
		<a href=\"#\" data-role=\"saveChanges\" data-category-id=\"{{cat}}\" class=\"ipsHide ipsButton ipsButton_verySmall ipsButton_light ipsButton_narrow\" data-ipstooltip=\"\" title=\"{{#lang}}save{{/lang}}\">{{#lang}}save{{/lang}}</a>\
		<a href=\"#\" data-role=\"cancelChanges\" data-category-id=\"{{cat}}\" class=\"ipsHide\" data-ipstooltip=\"\" title=\"{{#lang}}cancel{{/lang}}\">{{#lang}}cancel{{/lang}}</a>\
	</div>\
	<div class=\"ipsDataItem_generic ipsDataItem_size3 cBlog_manage_edit ipsPos_top ipsType_right\">\
		<a href=\"#\" data-action=\"delete\" data-category-id=\"{{cat}}\" class=\"ipsButton ipsButton_verySmall ipsButton_light ipsButton_narrow ipsPos_right\" data-ipstooltip title=\"{{#lang}}delete{{/lang}}\"><i class=\"fa fa-times-circle\"></i></a>\
		<a href=\"#\" data-action=\"edit\" data-category-id=\"{{cat}}\" class=\"ipsButton ipsButton_verySmall ipsButton_light ipsButton_narrow ipsPos_right\" data-ipstooltip title=\"{{#lang}}edit{{/lang}}\"><i class\=\"fa fa-pencil\"></i></a>\
	</div>\
</li>\
");
