var slidePos = 0;
var prevY = 0;
$(document).ready(function() {

   //initializes the page
   updateSlidePos(0);
   //add page markers
   drawMarkers();

   $(document).on("click", ".marker", function(e) {
      updateSlidePos($(this).index());
   });

   $(window).mousewheel(function(event) {
      //console.log(slidePos + ", " + event.deltaY);
      if(event.deltaY < 0 && prevY == -1 && prevY != event.deltaY) {
         updateSlidePos(slidePos+1);
      }
      else if(event.deltaY > 0 && prevY == 1 && prevY != event.deltaY) {
         updateSlidePos(slidePos-1);
      }
      prevY = event.deltaY;
   });
});

var nowScrolling = false;
function updateSlidePos(newPos)
{
   var oldPos = slidePos;
   if(!nowScrolling && newPos >= 0 && newPos < $('.slide').length)
   {
      nowScrolling = true;   
      setTimeout(function () {
         nowScrolling = false;
      }, 500);

      slidePos = newPos;
      drawMarkers();

      $('.slide').each(function (index, value) {
         //if(index == oldPos || index == slidePos)
            $(this).animate({'top': $(window).height() * (index-slidePos) + 'px'}, 500);
         //else
         //   $(this).css('top', $(window).height() * (index-slidePos));
      });
   }
}

function drawMarkers()
{
   $(".markerWrapper").empty();
   $('.slide').each(function (index, value) {
      if(index == slidePos)
         $('.markerWrapper').append("<li id='activeMarker' class='marker' />");
      else
         $('.markerWrapper').append("<li class='marker' />");
   });
}