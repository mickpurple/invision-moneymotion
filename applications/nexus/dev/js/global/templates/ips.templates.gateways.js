ips.templates.set('nexus.gateway.vaultAccount', " \
	<li>\
		<span class='ipsCustomInput'>\
			<input type='radio' name='{{fieldName}}[stored]' value='{{value}}' id='{{fieldName}}_stored{{random}}' data-control='toggle' data-toggles='{{fieldName}}_existing'>\
			<span></span>\
		</span>\
		<div class='ipsField_fieldList_content'>\
			<label for='{{fieldName}}_stored{{random}}'>{{label}}</label>\
		</div>\
	</li>\
");