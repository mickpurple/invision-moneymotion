﻿CKEDITOR.plugins.add("ipsautogrow",{init:function(b){b.on("instanceReady",function(e){function f(){"desktop"===ips.utils.responsive.getCurrentKey()&&c.find(".cke_wysiwyg_div").css({maxHeight:$(window).height()-200+"px"})}var c=$("#cke_"+b.name).find("\x3e div").first();$(c.parentNode);var d;ips.utils.responsive.getCurrentKey();e=_.debounce(f,200);f();$(window).on("resize",e);b.on("beforeModeUnload",function(a){"wysiwyg"==a.editor.mode&&(d=c.height())});b.on("mode",function(a){"source"==a.editor.mode&&
(a=$("#cke_"+b.name).find("textarea.cke_source"),Debug.log(a),a.css({height:d+"px"}),document.all&&!parseInt(a.width())&&a.css({width:"100%"}))});b.on("beforeCommandExec",function(a){"maximize"==a.data.name&&"source"==a.editor.mode?$("#cke_"+b.name).find("textarea.cke_source").css({height:d+"px"}):"maximize"==a.data.name&&"wysiwyg"==a.editor.mode&&(d=c.height())})})}});