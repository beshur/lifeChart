if (typeof page_var === "undefined") window.page_var = {}


$(function() {
	var appState = new AppState();

	var tester = window.setTimeout(function() {
		console.log('yo');
		appState.set({age: 24, country: "Ukraine", stage: 1});
	}, 1500)
})
$(window).resize(function() {
	page_var.w_w = $(window).width();
	page_var.w_h = $(window).height();

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

	stage1: function() {

		var weeksTotal = Math.floor(parseFloat(pageData['average'][this.get("country")])*52);
		var weeksAlready = Math.floor(this.get("age"))*52;

		var tpl = getTpl("#b_week_box__el", {win: false});
		var html = '';

		var i = 0;
		while(weeksTotal - i > 0) {
			html += tpl;
			i++;
		}

		var delta = weeksAlready - weeksTotal;
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


		$(".b_form_basic").fadeOut(300, function() {
			$(".b_chart").fadeIn(1500);
		});

	},

	stager: function(model) {
		switch(this.get("stage")) {
			case 1:
				this.stage1();
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

})

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
