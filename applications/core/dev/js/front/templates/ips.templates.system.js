ips.templates.set('follow.frequency', "\
	{{#hasNotifications}}\
		<i class='fa fa-bell'></i>\
	{{/hasNotifications}}\
	{{^hasNotifications}}\
		<i class='fa fa-bell-slash-o'></i>\
	{{/hasNotifications}}\
	{{text}}\
");