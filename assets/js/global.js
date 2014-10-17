if (typeof page_var === "undefined") window.page_var = {}


$(function() {
	$(window).resize();
	var tester = window.setTimeout(function() {
		console.log('yo');
		appState.set({age: 76, country: "Ukraine", stage: 1});
	}, 1500)
})
$(window).resize(function() {
	page_var.w_w = $(window).width();
	page_var.w_h = $(window).height();

	if (appState) appState.render();
});



var AppState = Backbone.Model.extend({
	defaults: {
		stage: 0,
		age: 0,
		country: "",
		year: 0
	},

	stage0: function() {
		var _this = this;

		var h = $(".b_form_basic").outerHeight();

		var shift = (page_var.w_h - h)/2;
		$(".b_form_basic").css("top", shift + "px")
			.addClass("hide")
			.removeClass("vishid")
			.fadeIn(1000);

		$(".b_form_basic form").on("submit", function(e) {
			e.preventDefault();
			var data = $(this).serializeObject();

			_this.set(data);
			_this.set("stage", 1);
		})
	},

	render: function() {

		var weeksTotal = Math.floor(parseFloat(pageData['average'][this.get("country")])*52);
		var weeksAlready = Math.floor(this.get("age"))*52;
		var delta = weeksAlready - weeksTotal;

		var w = $(".content-container").width();

		var canvas = $(".b_week_box > canvas")[0],
			canvasCtx = canvas.getContext('2d');

		if (!canvasCtx) {

			var tpl = getTpl("#b_week_box__el", {win: false});
			var html = '';

			var i = 0;
			while(weeksTotal - i > 0) {
				html += tpl;
				i++;
			}

			if (delta > 0) {
				tpl = getTpl("#b_week_box__el", {win: true});
				var i = 0;
				while(delta - i > 0) {
					html += tpl;
					i++;
				}
			}

			$(".b_week_box").html(html);

			$(".b_week_box__el").slice(0, weeksAlready).attr("data-already", true)

			var name = pageData['countryNames'][this.get("country")];
			if (typeof name != "undefined") {
				$(".b_chart .country_name").text(name);
			}

		} else {
			$(canvas).attr("width", w);

			var box = {
				w: 10,
				h: 10,
				p: 1
			}

			if (page_var.w_w < 968) {
				box = {
					w: 4,
					h: 4,
					p: 1
				}
			}
			var boxWidthUnit = box.w + box.p;
			var boxHeightUnit = box.h + box.p;

			var max = 0;
			if (delta <= 0) {
				max = weeksTotal;
			} else {
				max = weeksAlready;
			}
			var row = Math.floor(w / boxWidthUnit);
			var allRows = Math.ceil(max / row);

			$(canvas).attr("height", allRows*boxHeightUnit);

			var cursor = [0, 0];
			for (var i = 0; i < max; i++) {
				if (cursor[0] >= row) {
					cursor[0] = 0;
					cursor[1]++;
				}

				var styles = {
					already: "#d56161",
					yet: "#666",
					over: "#008000"
				}

				if (delta <= 0) {
					if (i <= weeksAlready) {
						canvasCtx.fillStyle = styles.already;
					} else {
						canvasCtx.fillStyle = styles.yet;
					}
				} else {
					if (i <= weeksTotal) {
						canvasCtx.fillStyle = styles.already;
					} else {
						canvasCtx.fillStyle = styles.over;
					}
				}
				canvasCtx.fillRect(cursor[0]*boxWidthUnit, cursor[1]*boxHeightUnit, box.w, box.h);


				if (canvasCtx.fillStyle == styles.already && page_var.w_w > 968) {
					canvasCtx.font = "12px Arial";
					canvasCtx.fillStyle = "#ffffff";
					canvasCtx.fillText("x", cursor[0]*boxWidthUnit + 2, cursor[1]*boxHeightUnit + 9);	
				}

				cursor[0]++;
			}

		}

		if (this.get("stage") != 0) {
			$(".b_form_basic").fadeOut(300, function() {
				$(".b_chart").fadeIn(1500);
			});
		}

	},

	stager: function(model) {
		switch(this.get("stage")) {
			case 1:
				this.render();
				break;
			default:
				this.stage0();
				break;
		}

	},

	initialize: function() {
		console.log('init');

		this.set("year", (new Date()).getUTCFullYear());

		$(window).resize();
		this.stage0();

		this.on("change:stage", this.stager);

	}

});

var appState = new AppState();


$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

function getTpl(tpl, options) {
	return _.template($(tpl).html())(options);
}
