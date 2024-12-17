ips.templates.set("eventLoading", "\
	<li class='ipsBox ipsBox--child event event--withImage event--loading'>\
		<div class='cEvents__skeleton cEvents__skeleton--eventImage'></div>\
		<div class='cEvents__details'>\
			<div class='cEvents__skeleton cEvents__skeleton--eventDate'></div>\
			<div class='cEvents__skeleton cEvents__skeleton--eventTitle'></div>\
			<div class='cEvents__skeleton cEvents__skeleton--eventBlurb'></div>\
		</div>\
	</li>\
");

ips.templates.set("nearMe", "\
	<ul class='eventList nearMe__events'>\
		<li class='nearMe__map cEvents__skeleton cEvents__skeleton--map' id='map'></li>\
		{{{events}}}\
	</ul>\
");