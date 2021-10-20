/* -*- js-indent-level: 8 -*- */
/*
 * L.Map.Feedback.
 */

/* global vex */
L.Map.mergeOptions({
	feedback: true,
	feedbackTimeout: 30000
});

L.Map.Feedback = L.Handler.extend({

	addHooks: function () {
		this._map.on('docloaded', this.onDocLoaded, this);
		L.DomEvent.on(window, 'message', this.onMessage, this);
	},

	removeHooks: function () {
		L.DomEvent.off(window, 'message', this.onMessage, this);
	},

	onDocLoaded: function () {
		setTimeout(L.bind(this.onFeedback, this), this._map.options.feedbackTimeout);
	},

	isWelcomeOpen: function () {
		for (var id in vex.getAll()) {
			var options = vex.getById(id).options;
			if (options.className.match(/welcome/g)) {
				return true;
			}
		}
		return false;
	},

	onFeedback: function () {
		if (this.isWelcomeOpen()) {
			setTimeout(L.bind(this.onFeedback, this), this._map.options.feedbackTimeout);
			return;
		}

		if (window.localStorage.getItem('WSDFeedbackEnabled') !== 'false') {
			if (this._map.welcome && this._map.welcome.isVisible())
				setTimeout(L.bind(this.onFeedback, this), 3000);
			else {
				this.showFeedbackDialog();
			}
		}
	},

	showFeedbackDialog: function () {
		if (this._iframeDialog && this._iframeDialog.hasLoaded())
			this._iframeDialog.remove();

		/*this._isMobile = false;
		  if (window.mode.isMobile()) {
		  this._isMobile = true;
		  }
		  console.debug(options);

		  console.debug('Getting co-bg-color: ');
		  var cssVar = getComputedStyle(document.documentElement).getPropertyValue('--co-primary-element');
		  console.debug(cssVar);
		  cssVar = cssVar.replace(/\s/g, '');
		  url += '?'+this._isMobile;
		  url += cssVar;
		  url += window.app.socket.WSDServer.Hash;*/

		this._iframeDialog = L.iframeDialog(window.feedbackLocation);
	},

	onError: function () {
		window.localStorage.removeItem('WSDFeedbackEnabled');
		this._iframeDialog.remove();
	},

	onMessage: function (e) {
		var data = e.data;

		if (data == 'feedback-show') {
			this._iframeDialog.show();
		}
		else if (data == 'feedback-never') {
			window.localStorage.setItem('WSDFeedbackEnabled', 'false');
			this._iframeDialog.remove();
		} else if (data == 'feedback-later') {
			this._iframeDialog.remove();
			setTimeout(L.bind(this.onFeedback, this), this._map.options.feedbackTimeout);
		} else if (data == 'feedback-submit') {
			window.localStorage.setItem('WSDFeedbackEnabled', 'false');
			this._iframeDialog.remove();
		}
	}
});
if (window.feedbackLocation && window.isLocalStorageAllowed) {
	L.Map.addInitHook('addHandler', 'feedback', L.Map.Feedback);
}
