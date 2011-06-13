SF.checkAndExec('expanding_replies', ['number'],
function(replies_number) {
	var $ol = $('#stream ol');
	if (! $ol.size()) return;
	var showWaiting = function($e) {
		var $wait = $('<li>');
		$wait.addClass('reply waiting');
		$e.replaceWith($wait);
		return $wait;
	};
	var displayReplyList = function(url, $before, num) {
		if (num == 0) {
			var $more = $('<li>');
			$more.attr('href', url);
			$more.addClass('reply more');
			$more.text('继续展开');
			$more.insertBefore($before);
			$before.remove();
			return;
		}
		$.get(url, function(data) {
			var avatar = /<div id="avatar">(.+?)<\/div>/.exec(data)[1];
			var author_exp = /<h1>(.+?)<\/h1>/g;
			author_exp.lastIndex = data.indexOf('<div id="latest">');
			var author = author_exp.exec(data)[1];
			var content = /<h2>([\s\S]+?)<\/h2>/.exec(data);
			if (! content) {
				content = '<strong>此消息已删除</strong>';
				spans = '';
			} else {
				content = content[1];
				var stamp_pos = content.indexOf('<span class="stamp">');
				var spans;
				if (stamp_pos == -1) {
					content = '<strong>此用户设置了隐私保护</strong>';
					spans = '';
				} else {
					spans = content.substring(stamp_pos);
					content = content.substring(0, stamp_pos);
					spans = spans.replace('redirect="/home" ', '');
				}
			}
			var id = 'status-' + url.split('/')[2].split('?')[0] +
					  '-' + Math.random();
			var $li = $('<li>');
			$li.attr('id', id);
			var gete = 'document.getElementById("' + id + '")';
			$li.attr('expended', 'expended');
			$li.addClass('reply unlight');
			$li.html(avatar + author +
				'<span class="content">' + content + '</span>' + spans);
			var scripts = 'FF.app.Stream.attach(' + gete + ');';
			if (content.indexOf('<img '))
				scripts += 'FF.app.Zoom.init(' + gete + ');'
			location.assign('javascript:' + scripts);
			var $links = $('a', $li);
			$links.eq(0).addClass('avatar');
			$links.eq(1).addClass('author');
			var $stamp = $('.stamp', $li);
			if (! $stamp.size()) {
				url = '';
			} else {
				var $reply = $('.reply', $stamp);
				if ($reply.size() == 0) {
					url = '';
				} else {
					url = $('a', $reply).attr('href');
				}
			}
			$li.insertBefore($before);
			if (! url) {
				$li.addClass('last');
				$before.remove();
			} else {
				displayReplyList(url, $before, num - 1);
			}
		});
	};
	var showExpand = function($item) {
		if ($item.attr('expended')) return;
		var $reply = $('.stamp .reply', $item);
		if (! $reply.length) return;
		$item.attr('expended', 'expended');
		var $expand = $('<li>');
		$expand.attr('href', $('a', $reply).attr('href'));
		$expand.addClass('reply more first');
		$expand.text('展开回复原文');
		$expand.insertAfter($item);
	};
    var hideReplyList = function() {
        var $t = $(this);
        $t.hide();
        var $item = $t.prev();
        $item.removeAttr('expended');
        showExpand($item);
        for (var $i = $t.next(); $i.hasClass('reply'); $i = $i.next())
            $t = $t.add($i);
        $t.remove();
    };
	var processItem = function($item) {
		if (! $item.is('li')) return;
        if ($item.hasClass('reply hide')) {
            $item.click(hideReplyList);
        } else if (! $item.attr('href')) {
			showExpand($item);
		} else {
			$item.click(function() {
                var $t = $(this);
				var $before = showWaiting($t);
                if ($t.hasClass('first')) {
                    var $hide_replies = $('<li>');
                    $hide_replies.addClass('reply hide');
                    $hide_replies.attr('expended', 'expended');
                    $hide_replies.text('隐藏回复原文');
                    $hide_replies.insertBefore($before);
                }
				displayReplyList($item.attr('href'), $before, replies_number);
			});
		}
	};
    var removeReplies = function($item) {
        if (! $item.attr('expended')) return;
        var $replies = $item.next('.reply');
        if (! $replies.length) return;
        for (var $i = $replies.next(); $i.is('.reply'); $i = $i.next())
            $replies.add($i);
        $replies.removeAttr('expended');
        $replies.remove();
    };
    $ol.bind('DOMNodeInserted',
            function(e) { processItem($(e.target)); });
    $('li', $ol).each(function() { showExpand($(this)); });
    $ol.bind('DOMNodeRemoved',
            function(e) { removeReplies($(e.target)); });
});
