if("undefined"!==typeof CommentpressAjaxSettings){var cpac_live=CommentpressAjaxSettings.cpac_live;var cpac_ajax_url=CommentpressAjaxSettings.cpac_ajax_url;var cpac_spinner_url=CommentpressAjaxSettings.cpac_spinner_url;var cpac_post_id=CommentpressAjaxSettings.cpac_post_id}var cpac_submitting=false;function cpac_ajax_callback(data){var diff=parseInt(data.cpac_comment_count)-parseInt(CommentpressAjaxSettings.cpac_comment_count);if(diff>0){for(var i=1;i<=diff;i++){var comment=eval("data.cpac_new_comment_"+i);cpac_add_new_comment(jQuery(comment.markup),comment.text_sig,comment.parent,comment.id);CommentpressAjaxSettings.cpac_comment_count++}}}function cpac_add_new_comment(o,m,g,f){var n=jQuery("div.comments_container");if(n.find("#li-comment-"+f)[0]){return}var b="#para_wrapper-"+m;var i="#para_heading-"+m;var k=jQuery(b+" ol.commentlist:first");if(g!="0"){var h="#li-comment-"+g;var e=jQuery(h+" > ol.children:first");if(e[0]){o.hide().css("background","#c2d8bc").appendTo(e).slideDown("fast",function(){o.animate({backgroundColor:"#ffffff"},1000,function(){o.css("background","transparent")})})}else{o.wrap('<ol class="children" />').parent().css("background","#c2d8bc").hide().appendTo(h).slideDown("fast",function(){o.parent().animate({backgroundColor:"#ffffff"},1000,function(){o.parent().css("background","transparent")})})}}else{if(k[0]){o.hide().css("background","#c2d8bc").appendTo(k).slideDown("fast",function(){o.animate({backgroundColor:"#ffffff"},1000,function(){o.css("background","transparent")})})}else{o.wrap('<ol class="commentlist" />').parent().css("background","#c2d8bc").hide().prependTo(b).slideDown("fast",function(){o.parent().animate({backgroundColor:"#ffffff"},1000,function(){o.parent().css("background","transparent")})})}}var j=n.find(i+" a");var l=j.text().split(" ");var c=parseInt(l[0]);c++;l[0]=c;l[1]="Comments";if(c==1){l[1]="Comment"}j.text(l.join(" "));j.css("background","#c2d8bc");j.animate({backgroundColor:"#EFEFEF"},1000);var c=c.toString();var a="#textblock-"+m;var d=a+" span small";jQuery(d).html(c);if(c=="1"){jQuery(a+" span.commenticonbox a.para_permalink").addClass("has_comments");jQuery(d).css("visibility","visible")}cp_enable_comment_permalink_clicks();cp_setup_comment_headers()}function cpac_ajax_update(){if(cpac_submitting){return}jQuery.post(cpac_ajax_url,{action:"cpac_get_new_comments",last_count:CommentpressAjaxSettings.cpac_comment_count,post_id:cpac_post_id},function(a,b){if(b=="success"){cpac_ajax_callback(a)}},"json")}function cpac_ajax_updater(a){if(a=="1"){CommentpressAjaxSettings.interval=window.setInterval(cpac_ajax_update,5000)}else{window.clearInterval(CommentpressAjaxSettings.interval)}}jQuery(document).ready(function(g){cpac_ajax_updater(cpac_live);var e,f;function i(){jQuery("#respond_title").after('<div id="error" style="background: #761d19; margin: 0 0 0.4em 0; padding: 0.4em; -moz-border-radius: 6px; -khtml-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px; color: #fff; line-height: 1.3em;"></div>');jQuery("#commentform").after('<img src="'+cpac_spinner_url+'" id="loading" alt="'+cpac_lang[0]+'" />');jQuery("#loading").hide();e=jQuery("#commentform");f=jQuery("#error");f.hide()}i();function c(){jQuery("#loading").hide();jQuery("#submit").removeAttr("disabled");jQuery("#submit").show();addComment.enableForm();cpac_submitting=false}function b(m){var t=e.find("#text_signature").val();var o=e.find("#comment_parent").val();var k="#para_wrapper-"+t;var p="#para_heading-"+t;if(o!="0"){var q="#li-comment-"+o;var n=jQuery(q+" > ol.children:first");if(n[0]){h(m,q+" > ol.children:first > li:last",n,q+" > ol.children:first > li:last")}else{h(m,q+" > ol.children:first",q,q+" > ol.children:first > li:last")}}else{var s=jQuery(k+" > ol.commentlist:first");if(s[0]){h(m,k+" > ol.commentlist:first > li:last",s,k+" > ol.commentlist:first > li:last")}else{d(m,k+" > ol.commentlist:first",k,k+" > ol.commentlist:first > li:last")}}jQuery("#respond").slideUp("fast",function(){addComment.cancelForm()});var r=m.find(p);jQuery(p).replaceWith(r);var l=r.text().split(" ")[0];j(t,l);cp_enable_comment_permalink_clicks();cp_setup_comment_headers();e.find("#comment").val("")}function h(k,m,n,l){if(k===undefined||k===null){return}k.find(m).hide().appendTo(n);a(m,l)}function d(k,m,n,l){if(k===undefined||k===null){return}k.find(m).hide().prependTo(n);a(m,l)}function a(m,l){var k=jQuery(l).attr("id");var n="#comment-"+k.split("-")[2];var o=jQuery(n);o.css("background","#c2d8bc");jQuery(m).slideDown("slow",function(){jQuery("#comments_sidebar .sidebar_contents_wrapper").scrollTo(o,{duration:cp_scroll_speed,axis:"y",onAfter:function(){o.animate({backgroundColor:"#ffffff"},1000,function(){o.css("background","transparent")})}})})}function j(n,l){var l=l.toString();var k="#textblock-"+n;var m=k+" span small";jQuery(m).html(l);if(l=="1"){jQuery(k+" span.commenticonbox a.para_permalink").addClass("has_comments");jQuery(m).css("visibility","visible")}if(n!=""){var o=jQuery(k);cp_scroll_page(o)}else{cp_scroll_to_top(0,cp_scroll_speed)}}jQuery("#commentform").live("submit",function(k){cpac_submitting=true;f.hide();if(e.find("#author")[0]){if(e.find("#author").val()==""){f.html('<span class="error">'+cpac_lang[1]+"</span>");f.show();cpac_submitting=false;return false}if(e.find("#email").val()==""){f.html('<span class="error">'+cpac_lang[2]+"</span>");f.show();cpac_submitting=false;return false}var l=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;if(!l.test(e.find("#email").val())){f.html('<span class="error">'+cpac_lang[3]+"</span>");f.show();if(k.preventDefault){k.preventDefault()}cpac_submitting=false;return false}}if(cp_tinymce=="1"){tinyMCE.triggerSave();addComment.disableForm()}if(e.find("#comment").val()==""){f.html('<span class="error">'+cpac_lang[4]+"</span>");f.show();addComment.enableForm();cpac_submitting=false;return false}jQuery(this).ajaxSubmit({beforeSubmit:function(){jQuery("#loading").show();jQuery("#submit").attr("disabled","disabled");jQuery("#submit").hide()},error:function(m){f.empty();var n=m.responseText.match(/<p>(.*)<\/p>/);f.html('<span class="error">'+n[1]+"</span>");f.show();c();return false},success:function(n){try{var m=jQuery(n);b(m);c()}catch(o){c();alert(cpac_lang[6]+"\n\n"+o)}}});return false})});