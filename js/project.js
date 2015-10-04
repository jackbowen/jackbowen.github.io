$(document).ready(function() {
   scaleText();
   parallaxScroll();
   
   $('#overlay').blurjs({
        source: 'body',
        radius: 7,
        overlay: 'rgba(255,255,255,0.4)'
    });
});

$(window).resize( function() {
   scaleText();
});

var titleHeight; 

function scaleText(){
   $('body').removeClass();
   var viewPortWidth = $(window).width();
   if (viewPortWidth > 1900) {
      $('body').addClass('extraWide');
   }
   else if (viewPortWidth > 1400) {
      $('body').addClass('wide');
   }
   else if (viewPortWidth > 1000) {
      $('body').addClass('standard');
   }
   else if (viewPortWidth > 700) {
      $('body').addClass('narrow');
   }
   else {
      $('body').addClass('extraNarrow');
   }

   titleHeight = $('#title').height();
   $('#title').css('margin-top', (titleHeight/2)+'px');
   $('#content').css('margin-top', (titleHeight*2/3)+'px');
}

$(window).bind('scroll',function(e){
    parallaxScroll();
});
 
function parallaxScroll(){
   var scrolled = $(window).scrollTop();
   //console.log(scrolled);
   if(scrolled < titleHeight/3)
   {
      $('#title').css('top',(0-(scrolled*1.6))+'px');
      $('#content').css('margin-top', ((titleHeight*2/3)+scrolled)+'px');
   }
}

$(function(){
   $('#map').okzoom({
      width: 250,
      height: 250,
      round: true,
      background: "#fff",
      //backgroundRepeat: "false",
      shadow: "0 0 5px #000",
      border: "1px solid black"
   });
});

$('#map').click(function(e) {
   alert("hover");
});


