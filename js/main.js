var slidePos = 0;
var prevY = 0;
$(document).ready(function() {

   //initializes the page
   updateSlidePos(0);

   $(window).mousewheel(function(event) {
      console.log(slidePos + ", " + event.deltaY);
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

      $('.slide').each(function (index, value) {
         if(index == oldPos || index == slidePos)
            $(this).animate({'top': $(window).height() * (index-slidePos) + 'px'}, 500);
         else
            $(this).css('top', $(window).height() * (index-slidePos));
      });
   }
}