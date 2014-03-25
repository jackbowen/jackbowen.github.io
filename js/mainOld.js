var slidePos = 0;

$(document).ready(function() {
   $(window).mousewheel(function(event) {
      if(event.deltaY < 0)
         updateSlidePos(slidePos+1);
      else if(event.deltaY > 0)
         updateSlidePos(slidePos-1);
   });
});

var nowScrolling = false;
var timeout = false;
function updateSlidePos(newPos)
{
   var oldPos = slidePos;
   if(!nowScrolling && newPos >= 0 && newPos < $('.slide').length)
   {
      nowScrolling = true;
//      timeout = setTimeout(function () {
//         nowScrolling = false;
//      }, 2000);
      setTimeout(function () {
         nowScrolling = false;
      }, 500);

      slidePos = newPos;

      $('.slide').each(function (index, value) {
         //console.log("index: " + index + ", value: " + value);
         if(index == oldPos || index == slidePos)
            $(this).animate({'top': $(window).height() * (index-slidePos) + 'px'}, 100);
         else
            $(this).css('top', $(window).height() * (index-slidePos));
      });


   }





//   else
//   {
//      clearTimeout(timeout);
//   }

//   timeout = setTimeout(function () {
//      nowScrolling = false;
//   }, 500);
}

