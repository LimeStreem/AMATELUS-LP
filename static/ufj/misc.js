var misc = {
	TTS: function( txt ) {
		$.ajax( {
			url: "tts.php",
			data: {
				text: txt
			},
			dataType: "jsonp",
			jsonp: "callback",
			success: function( data ) {
				if ( data[ "error" ] == null ) {
					var audio = document.getElementsByTagName( "audio" )[ 0 ];
					audio.pause();
					$( "audio" ).attr( "src", "data:audio/wav;base64," + data['result']['audio'] )[ 0 ].play();
					//( new Audio("data:audio/wav;base64," + data['result']['audio']) ).play();
				}
			}
		} );
	},

	recognition: function() {

		var rec = new Recognition;
		if ( !rec.canPlay ) return;

		rec.onerror = function() {
			//alert( "マイクに関してエラーが発生しました。\nマイクがセットされていない、あるいは日本語認識に対応していないブラウザである可能性があります。" );
		};

		rec.onend = function() {
			rec.start();
		};

		rec.onresult = function( result ) {
			$( "#userInput" ).val( result );
		};

		rec.onfinal = function( result ) {
			$( "#userInput" ).val( result ).change();
		};

		rec.start();

	}
};