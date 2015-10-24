// ==UserScript==
// @name         SoundCloud Oneboxer
// @namespace    http://stackexchange.com/users/4337810/
// @version      1.0
// @description  Oneboxes links to SoundCloud tracks
// @author       ᔕᖺᘎᕊ (http://stackexchange.com/users/4337810/)
// @match        *://chat.stackoverfow.com/*
// @match        *://chat.meta.stackexchange.com/*
// @match        *://chat.stackexchange.com/*
// @grant        none
// ==/UserScript==
//Code based on my previous Github Link Oneboxer: http://stackapps.com/q/6535/26088!

$('head').append('<link rel="stylesheet" type="text/css" href="https://cdn.rawgit.com/shu8/SEChat-soundcloudOneboxer/master/style.css">'); //add stylesheet to head

var client_id = 'f557cccd917d8ff72fb731f9b6b3aee5';

function extractFromUrlAndGetInfo(link, $obj) {
    $.get("http://api.soundcloud.com/resolve?url="+link+"&client_id="+client_id, function(d) {
        var user_avatar_url = d.user.avatar_url;
        var username = d.user.username;
        var artwork_url = d.artwork_url;
        var title = d.title;
        var playback_count = d.playback_count;
        var genre = d.genre;
        var permalink = d.permalink_url;
        var tags = d.tag_list;//.match(/(?:[^\s"]+|"[^"]*")+/g); //http://stackoverflow.com/a/16261693/3541881 
        var desc = d.description;
        var track_no = d.id;

        var tagsList = '';
        if(tags.length) {
            tags=tags.match(/(?:[^\s"]+|"[^"]*")+/g);
            for (var i=0; i<tags.length; i++) {
                tagsList += "<span class='tag'>"+tags[i].replace(/"/g, '')+"</span>";
            }
        }
        $obj.find('.content').html("<div class='sc-onebox'> \
                                       <div class='info'>"+username+"</div> \
                                       <div class='title'><a href='"+permalink+"'>"+title+"</a></div> \
                                       <div class='main'> \
                                           <img src='"+(artwork_url ? artwork_url : user_avatar_url)+"' /> \
                                           <div class='tags'>"+(tagsList ? tagsList : "No tags")+"</div> \
                                           <br> \
                                           <div class='desc'>&nbsp;"+(desc ? desc : "There is no description for this item :(")+"</div> \
                                           <div class='player'><iframe width='100%' height='100' scrolling='no' frameborder='no' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/"+track_no+"'></iframe></div> \
                                       </div> \
                                   </div>");
    });
}

var observer = new MutationObserver(function (mutations) { //MutationObserver;
    mutations.forEach(function (mutation) {
        var length = mutation.addedNodes.length;
        for (var i = 0; i < length; i++) {
            var $addedNode = $(mutation.addedNodes[i]);
            if (!$addedNode.hasClass('message')) {
                return;
            } //don't run if new node is NOT a .message

            var $lastanchor = $addedNode.find('a').last();
            if (!$lastanchor) {
                return;
            } //don't run if there is no link

            var lastanchorHref = $lastanchor.attr('href');
            if ($addedNode.text().trim().indexOf(' ') == -1 && lastanchorHref.indexOf('soundcloud.com') > -1) { //if there are no spaces (ie. only one word) and if the link is to soundcloud...
                extractFromUrlAndGetInfo(lastanchorHref, $addedNode); //pass URL and added node to the function and add the onebox
            }
        }
    });
});

setTimeout(function () {
    $('.message').each(function () { //loop through EXISTING messages to find oneboxable messages
        var link = $(this).find('a[href*="soundcloud.com"]');
        if (!link.length || $(this).text().trim().indexOf(' ') > -1) { //if there is a link to soundcloud AND if there is no space (ie. nothing other than the link)
            return;
        }
        extractFromUrlAndGetInfo(link.attr('href'), $(this)); //pass URL and message to the function and add the onebox
    });

    observer.observe(document.getElementById('chat'), { //observe with the mutation observer for NEW messages
        childList: true,
        subtree: true
    });
}, 1000);
