var Recognition = function() {

	if ( "webkitSpeechRecognition" in window ) {
		var speech = new webkitSpeechRecognition;
		speech.lang = "ja-JP";
		speech.continuous = true;	// 継続認識
		speech.interimResults = true;	// 中間結果の表示
		this.canPlay = true;
	} else {
		var speech = function() {};
		this.canPlay = false;
	}

	this.obj = speech;

	var that = this;

	speech.onresult = function(event){

		var results = event.results;

		if ( typeof( results ) == 'undefined' ) {
			var onend = speech.onend;
			speech.onend = null;
			speech.stop();
			speech.onend = onend;
			return;
		}

		var final_transcript = "";

		for (var i = event.resultIndex; i<results.length; i++){
			var result = results[i][0];


			if (results[i].isFinal) {
				final_transcript = result.transcript;
			} else {
				that.onresult(result.transcript);
				speech.continuous = false;	// 継続認識
				speech.continuous = true;	// 継続認識

			}

		}

		if ( final_transcript != "" ){
			that.onfinal( final_transcript );
		}

	};

};

Recognition.prototype = {
	constructor: Recognition,
	start: function() {
		this.obj.start();
	},
	stop: function() {
		this.obj.stop();
	},
	set onnomatch( fn ) {
		this.obj.onnomatch = fn;
	},
	get onnomatch() {
		return this.obj.onnomatch;
	},
	set onaudiostart( fn ) {
		this.obj.onaudiostart = fn;
	},
	get onaudiostart() {
		return this.obj.onaudiostart;
	},
	set onaudioend( fn ) {
		this.obj.onaudioend = fn;
	},
	get onaudioend() {
		return this.obj.onaudioend;
	},
	set onsoundstart( fn ) {
		this.obj.onsoundstart = fn;
	},
	get onsoundstart() {
		return this.obj.onsoundstart;
	},
	set onsoundend( fn ) {
		this.obj.onsoundend = fn;
	},
	get onsoundend() {
		return this.obj.onsoundend;
	},
	set onspeechstart( fn ) {
		this.obj.onspeechstart = fn;
	},
	get onspeechstart() {
		return this.obj.onspeechstart;
	},
	set onspeechend( fn ) {
		this.obj.onspeechend = fn;
	},
	get onspeechend() {
		return this.obj.onspeechend;
	},
	set onerror( fn ) {
		this.obj.onerror = fn;
	},
	get onerror() {
		return this.obj.onerror;
	},
	set onstart( fn ) {
		this.obj.onstart = fn;
	},
	get onstart() {
		return this.obj.onstart;
	},
	set onend( fn ) {
		this.obj.onend = fn;
	},
	get onend() {
		return this.obj.onend;
	},
	onresult: function() {},
	onfinal: function() {}
};
