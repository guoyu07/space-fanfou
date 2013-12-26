var $ = document.getElementById.bind(document);
var $$ = document.querySelectorAll.bind(document);

function forEach(array, func, context) {
	return Array.prototype.forEach.call(array, func, context);
}

document.addEventListener('DOMContentLoaded', function() {
	function getValue($elem) {
		if ($elem.type == 'checkbox')
			return $elem.checked;
		else
			return $elem.tagName == 'SELECT' ?
				$elem.value : JSON.parse($elem.value);
	}
	function setValue($elem, value) {
		if ($elem.type == 'checkbox') {
			if ($elem.checked !== value)
				SF.fn.emulateClick($elem);
		} else $elem.value = value;
	}

	var $foldables = $$('[foldable]');
	forEach($foldables, function($foldable) {
		var $foldable_src = $foldable.querySelector('[foldable_src]');
		setValue($foldable_src, true);

		$foldable_src.addEventListener('change', function(e) {
			if (getValue(this))
				$foldable.classList.remove('folded');
			else
				$foldable.classList.add('folded');
		}, false);
	});
	forEach($$('[foldable_tgt]'), function($f) {
		$f.style.height = 'auto';
	});

	/*document.body.classList.add('init');
	forEach($$('.tabs ul'), function($ul) {
		$ul.style.maxHeight = $ul.offsetHeight + 'px';
	});
	document.body.classList.remove('init');*/

	// 获取选项信息
	forEach($$('[key]'), function($t) {
		setValue($t, SF.st.settings[$t.getAttribute('key')]);
	});

	forEach($$('.btn_apply'), function(btn) {
		btn.addEventListener('click', function() {
			forEach($$('[key]'), function($t) {
				var key = $t.getAttribute('key');
				SF.st.settings[key] = getValue($t);
			});
			localStorage['settings'] = JSON.stringify(SF.st.settings);
		});
	});

	var unexpanded_msg = '显示更多设置…';
	var expanded_msg = '隐藏更多设置…';
	var expanders = $$('.more-settings-expander');
	forEach(expanders, function(btn) {
		btn.addEventListener('click', function(e) {
			e.preventDefault();
			var more_settings = $$('ul.more-settings');
			if (btn.textContent === unexpanded_msg) {
				forEach(more_settings, function(s) {
					s.style.display = 'block';
				});
				forEach(expanders, function(expander) {
					expander.textContent = expanded_msg;
				});
			} else {
				forEach(more_settings, function(s) {
					s.style.display = 'none';
				});
				forEach(expanders, function(expander) {
					expander.textContent = unexpanded_msg;
				});
			}
		});
	});

	addEventListener('unload', function() {
		SF.fn.emulateClick($$('.btn_apply')[0]);
	}, false);

	$('version').textContent = localStorage['sf_version'];

	var $wrapper = $('wrapper');
	var $screenshots = $$('.screenshot');
	var $tabs = $('tabs');
	var $screenshot = $('screenshot');
	var $preview_img = $('preview_img');
	var $preview_des = $('preview_des');

	for (var i = 0; i < $screenshots.length; i++) {
		var $ss = $screenshots[i];
		$ss.description = $ss.title;
		$ss.title = '';
		$ss.addEventListener('click', function(e) {
			if (e.target !== this) return;
			e.preventDefault();
			e.stopPropagation();
			this.querySelector('[type="checkbox"]').click();
		});
		$ss.addEventListener('mouseover', function(e) {
			if (e.target != this) return;
			$preview_img.src = this.rel;
			$preview_des.textContent = this.description;
			$screenshot.classList.remove('fadeOut');
		}, false);
		$ss.addEventListener('mousemove', function(e) {
			posPreview(e.pageX, e.pageY);
		}, false);
		$ss.addEventListener('mouseout', function(e) {
			if (e.target != this) return;
			$screenshot.classList.add('fadeOut');
		}, false);
	}

	function posPreview(x, y) {
		var oH = $wrapper.offsetHeight;
		var targetX = x + 30;
				targetY = y - 10;

		var height = $screenshot.clientHeight;
		if (targetY + height + 10> oH)
				targetY = oH - height - 10;

		$screenshot.style.left = targetX + 'px';
		$screenshot.style.top = targetY + 'px';
	}
}, false);

function current(target, self) {
	localStorage['latest_options_tab'] = self.id;
	var button = self.parentElement;
	if (button.classList.contains('current')) return;
	var current_button = $$('li.current a')[0];
	var current_tab_no = current_button ?
		+current_button.id.split('').reverse()[0] : $$('#navigation ul li').length;
	var target_tab_no = self.id.split('').reverse()[0];
	var tab = $$('#navigation li');
	var i, j, len = tab.length;
	for (i = 0; i < len; i++) {
		tab[i].classList.remove('current');
	}
	button.classList.add('current');
	for (i = 0; j = $('tabs' + i); i++) {
		j.style.display = 'none';
		j.style.webkitAnimation = j.style.animation = '';
	}
	var target_style = $(target).style;
	target_style.display = 'block';
	var animation_name = current_tab_no > target_tab_no ? 'leftSlideIn' : 'rightSlideIn';
	target_style.webkitAnimation = animation_name + '.2s ease-out';

	var ul = $$('#' + target + ' ul')[0];
	if (! ul) return;
	clearTimeout(ul.timeout);
	/*ul.style.overflow = 'hidden';
	ul.timeout = setTimeout(function() {
		ul.style.overflow = '';
	}, 250);*/

	forEach($$('button'), function(btn) {
		clearTimeout(btn.timeout);
		btn.style.webkitAnimation = 'btn-fadeIn .6s ease-in';
		btn.timeout = setTimeout(function() {
			btn.style.webkitAnimation = '';
		}, 600);
	});
}

addEventListener('load', function load(e) {
	forEach($$('#navigation a'), function(nav_link, i) {
		nav_link.onclick = function(e) {
			current('tabs' + i, this);
		}
	});

	forEach($$('.avatar img'), function(img) {
		img.src += '?' + (new Date).getTime();
	});

	setTimeout(function() {
		if (document.documentElement.clientHeight < 300) return load();
		forEach($$('div[id^="tabs"]'), function(tab) {
			tab.style.visibility = 'visible';
		});
		var latest_tab = localStorage['latest_options_tab'] || 'tab1';
		SF.fn.emulateClick($(latest_tab));
	}, 16);

	var key_map = { };
	var words = [];
	var i = 10;
	while (--i >= 0) {
		words.push(i + '');
	}
	var c = 65, i = 26, b;
	while (i--) {
		b = String.fromCharCode(c);
		words.push(b);
		words.push(b.toLowerCase());
		c++;
	}
	words.push(
		'~', '&', '_', '.', '{',
		'}', '"', ':', '+', '-',
		'(', ')', '%', '/', '='
	);
	var _words = [];
	var __words = words.slice(0);
	while (words.length) {
		var i = words.length;
		i = Math.max(parseInt(i / 1.5) - 1, 0);
		_words.push.apply(_words, words.splice(i));
	}
	words = __words;
	function coder(_s, _t) {
		return function(s) {
			var i = _s.indexOf(s + '');
			return i === -1 ? s : _t[i];
		}
	}
	function processor(coder) {
		return function(str) {
			return (str + '').split('').map(function(s) {
					return coder(s);
				}).join('');
		}
	}
	var encode = processor(coder(words, _words));
	var decode = processor(coder(_words, words));

	var bg = chrome.extension.getBackgroundPage();

	var count = SF.fn.getData('giftbox_count') || 0;
	if (count >= 10) {
		$$('.locked')[0].hidden = true;
	} else {
		$$('.unlocked')[0].hidden = true;
		$('giftbox_count').textContent = count;
	}

	var userid = bg.SF.currentUserId;

	if (count >= 10) {
		var invite_code = JSON.stringify({
			id: userid
		}).replace(/^{"|"}$/g, '');
		invite_code = CryptoJS.enc.Utf8.parse(invite_code);
		invite_code = CryptoJS.enc.Base64.stringify(invite_code);
		invite_code = encode(invite_code);
		$('giveaway_invite_code').value = invite_code;
		$('giveaway_invite_code').addEventListener('mouseover', function(e) {
			this.selectionStart = 0;
			this.selectionEnd = this.value.length;
		});
	} else {
		function fail() {
			$('use_invite_code').textContent = '验证失败 :(';
			$('use_invite_code').disabled = false;
			setTimeout(function() {
				$('use_invite_code').textContent = '使用奥特蛋';
			}, 5000);
		}
		function showInvalid() {
			$('invalid_invite_code').style.display = '';
			$('use_invite_code').textContent = '使用奥特蛋';
			$('use_invite_code').disabled = false;
		}
		var input = $('input_invite_code');
		$('use_invite_code').onclick = function(e) {
			$('invalid_invite_code').style.display = 'none';
			var failed = false;
			function checkPage(type, page) {
				var url = 'http://fanfou.com/' + type +
					'/' + encodeURIComponent(userid) +
					'/p.' + page;
				var xhr = new XMLHttpRequest;
				xhr.open('GET', url, true);
				xhr.onload = function(e) {
					if (failed) return;
					var html = xhr.responseText;
					if (! html) return fail();
					var pattern = '<a href="/' + data.id + '" class="name">';
					if (html.indexOf(pattern) > -1) {
						if (type === 'friends') {
							is_following = true;
						} else {
							is_followed = true;
						}
						if (is_following && is_followed) {
							SF.fn.setData('giftbox_count', 10);
							forEach($$('[key^="xmas_spec_theme."]'), function(item) {
								item.checked = true;
							});
							location.reload();
						}
					} else {
						page++;
						var next_page_pattern = '<a href="/' + type + '/' +
							encodeURIComponent(userid) + '/p.' +
							page + '">下一页</a>';
						if (html.indexOf(next_page_pattern) > -1) {
							checkPage(type, page);
						} else {
							failed = true;
							showInvalid();
						}
					}
				}
				xhr.onerror = fail;
				xhr.send(null);
			}
			if (! input.value) return;
			var data;
			try {
				var code = decode(input.value.trim());
				code = CryptoJS.enc.Base64.parse(code).toString(CryptoJS.enc.Utf8);
				data = JSON.parse('{"' + code + '"}');
			} catch (e) {
				showInvalid();
			}
			if (! data || ! data.id) return;
			this.textContent = '正在验证奥特蛋，请稍等…'
			this.disabled = true;
			var is_followed = false;
			var is_following = false;
			var friends_checked = false;
			var followers_checked = false;
			checkPage('friends', 1);
			checkPage('followers', 1);
		}
	}
}, false);
onmousewheel = function(e) { }

var CryptoJS=CryptoJS||function(h,o){var f={},j=f.lib={},k=j.Base=function(){function a(){}return{extend:function(b){a.prototype=this;var c=new a;b&&c.mixIn(b);c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.$super.extend(this)}}}(),i=j.WordArray=k.extend({init:function(a,b){a=
this.words=a||[];this.sigBytes=b!=o?b:4*a.length},toString:function(a){return(a||p).stringify(this)},concat:function(a){var b=this.words,c=a.words,d=this.sigBytes,a=a.sigBytes;this.clamp();if(d%4)for(var e=0;e<a;e++)b[d+e>>>2]|=(c[e>>>2]>>>24-8*(e%4)&255)<<24-8*((d+e)%4);else if(65535<c.length)for(e=0;e<a;e+=4)b[d+e>>>2]=c[e>>>2];else b.push.apply(b,c);this.sigBytes+=a;return this},clamp:function(){var a=this.words,b=this.sigBytes;a[b>>>2]&=4294967295<<32-8*(b%4);a.length=h.ceil(b/4)},clone:function(){var a=
k.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var b=[],c=0;c<a;c+=4)b.push(4294967296*h.random()|0);return i.create(b,a)}}),l=f.enc={},p=l.Hex={stringify:function(a){for(var b=a.words,a=a.sigBytes,c=[],d=0;d<a;d++){var e=b[d>>>2]>>>24-8*(d%4)&255;c.push((e>>>4).toString(16));c.push((e&15).toString(16))}return c.join("")},parse:function(a){for(var b=a.length,c=[],d=0;d<b;d+=2)c[d>>>3]|=parseInt(a.substr(d,2),16)<<24-4*(d%8);return i.create(c,b/2)}},n=l.Latin1={stringify:function(a){for(var b=
a.words,a=a.sigBytes,c=[],d=0;d<a;d++)c.push(String.fromCharCode(b[d>>>2]>>>24-8*(d%4)&255));return c.join("")},parse:function(a){for(var b=a.length,c=[],d=0;d<b;d++)c[d>>>2]|=(a.charCodeAt(d)&255)<<24-8*(d%4);return i.create(c,b)}},q=l.Utf8={stringify:function(a){try{return decodeURIComponent(escape(n.stringify(a)))}catch(b){throw Error("Malformed UTF-8 data");}},parse:function(a){return n.parse(unescape(encodeURIComponent(a)))}},m=j.BufferedBlockAlgorithm=k.extend({reset:function(){this._data=i.create();
this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=q.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var b=this._data,c=b.words,d=b.sigBytes,e=this.blockSize,f=d/(4*e),f=a?h.ceil(f):h.max((f|0)-this._minBufferSize,0),a=f*e,d=h.min(4*a,d);if(a){for(var g=0;g<a;g+=e)this._doProcessBlock(c,g);g=c.splice(0,a);b.sigBytes-=d}return i.create(g,d)},clone:function(){var a=k.clone.call(this);a._data=this._data.clone();return a},_minBufferSize:0});j.Hasher=m.extend({init:function(){this.reset()},
reset:function(){m.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);this._doFinalize();return this._hash},clone:function(){var a=m.clone.call(this);a._hash=this._hash.clone();return a},blockSize:16,_createHelper:function(a){return function(b,c){return a.create(c).finalize(b)}},_createHmacHelper:function(a){return function(b,c){return r.HMAC.create(a,c).finalize(b)}}});var r=f.algo={};return f}(Math);
(function(){var h=CryptoJS,i=h.lib.WordArray;h.enc.Base64={stringify:function(b){var e=b.words,f=b.sigBytes,c=this._map;b.clamp();for(var b=[],a=0;a<f;a+=3)for(var d=(e[a>>>2]>>>24-8*(a%4)&255)<<16|(e[a+1>>>2]>>>24-8*((a+1)%4)&255)<<8|e[a+2>>>2]>>>24-8*((a+2)%4)&255,g=0;4>g&&a+0.75*g<f;g++)b.push(c.charAt(d>>>6*(3-g)&63));if(e=c.charAt(64))for(;b.length%4;)b.push(e);return b.join("")},parse:function(b){var b=b.replace(/\s/g,""),e=b.length,f=this._map,c=f.charAt(64);c&&(c=b.indexOf(c),-1!=c&&(e=c));
for(var c=[],a=0,d=0;d<e;d++)if(d%4){var g=f.indexOf(b.charAt(d-1))<<2*(d%4),h=f.indexOf(b.charAt(d))>>>6-2*(d%4);c[a>>>2]|=(g|h)<<24-8*(a%4);a++}return i.create(c,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();