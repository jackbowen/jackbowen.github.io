/*
  MAINSTUDIO
  Copyright (C) 2013 by Systemantics, Bureau for Informatics

  Systemantics GmbH
  Bleichstr. 11
  41747 Viersen
  GERMANY

  Web:    www.systemantics.net
  Email:  hello@systemantics.net

  Permission granted to use the files associated with this
  website only on your webserver.

  Changes to these files are PROHIBITED due to license restrictions.
*/



var isTouch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
   noTouch = !isTouch;

// From https://github.com/jquery/jquery-ui/blob/1.8.23/ui/jquery.ui.core.js
$.fn.disableSelection = function() {
   return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
      ".ui-disableSelection", function( event ) {
         event.preventDefault();
      });
};

var slideshowDuration = 500,
   duration = 250;

$.fn.slideshow = function() {
   return $(this).each(function () {
      var slideshow = $(this),
         orientation = slideshow.hasClass("vertical") ? "vertical" : "horizontal",
         slides = slideshow.find(".slide"),
         navigation = slideshow.find(".navigation");
         current = slides.eq(0),
         touchStartX = 0,
         touchStartY = 0;

      // Set project url
      $("#menu .button-project-info a").attr("href", current.attr("data-href"));

      // Set project link url
      navigation.find(".project-link").attr("data-href", current.attr("data-secimg-href"));

      // Add slides wrapper
      if (orientation == "vertical") {
         slides.wrapAll('<div class="slideshow-content" style="height:100%" />');
         slides.each(function (i) {
            $(this).css("top", (i*100)+"%");
         });
      } else {
         slides.wrapAll('<div class="slideshow-content" />');
         slideshow
            .find(".slideshow-content")
               .css("width", (slides.length*100) + "%");
         slides
            .css("width", (100/slides.length) + "%");
      }

      // Hide vertical navigation until all images are loaded only if it is not a pages-slideshow
      if (!slideshow.hasClass("pages-slideshow")) {

         $("#projects-slideshow .navigation-vertical")
            .hide();

         // Hide vertical next navigation if there is only one slide
         if (slides.length==1) {
            navigation.find(".next").css("display", "none");
         }

         if (current.index()==0) {
            // Hide prev navigation at the beginning if current is the first image
            navigation.find(".prev").css("display", "none");
            // Show back arrow if current is the first iamge
            $(".navigation-horizontal .back").css("display", "block");
         }
      }

      current.addClass("current");

      slideshow
         // Trigger next slide by index and next
         .on("goto-internal", function (e, next, index) {
            var nextIndex = '';

            if (!index) {
               nextIndex = slides.index(next);
            } else {
               nextIndex = index;
            }

            next = $(next);

            // Animate next slide
            if (orientation == "vertical") {
               if (slideshow.hasClass("is-animating")) {
                  return;
               } else {
                  slides.each(function (i) {
                     slideshow.addClass("is-animating");
                     $(this)
                        .animate({
                           top: ((i-nextIndex)*100)+"%"
                        }, slideshowDuration, function () {
                           slideshow.removeClass("is-animating");
                        });
                  });
               }
            } else {
               if (slideshow.hasClass("is-animating")) {
                  return;
               } else {
                  slideshow
                     .addClass("is-animating")
                     .find(".slideshow-content")
                        .animate({
                           marginLeft: "-"+(nextIndex*100)+"%"
                        }, slideshowDuration, function () {
                           slideshow.removeClass("is-animating");
                        });
                  if (next.index()>0) {
                     $(".navigation-horizontal .back").css("display", "none");
                  }
                  // Show back arrow if next is the first iamge of the horizontal slideshow
                  if (next.index()==0) {
                     $(".navigation-horizontal .back").css("display", "block");
                  }
               }
            }

            // Reset project link url
            navigation.find(".project-link").attr("data-href", "");

            $(window).trigger("projecttitle-stopfading", current);

            // Show project title of next slide
            $(window).trigger("projecttitle-fadein", next);

            next
               .addClass("current")
               .siblings()
                  .removeClass("current");

            // Update project url
            $("#menu .button-project-info a").attr("href", next.attr("data-href"));

            // Update project link url
            navigation.find(".project-link").attr("data-href", next.attr("data-secimg-href")).css("display", "block");
            if (!next.attr("data-secimg-href")) {
               navigation.find(".project-link").css("display", "none");
            }

            // Show / hide navigation arrows
            if (slides.index(next)>0) {
               navigation.find(".prev").css("display", "block");
            } else {
               navigation.find(".prev").css("display", "none");
            }
            if (slides.index(next)<slides.length-1) {
               navigation.find(".next").css("display", "block");
            } else {
               navigation.find(".next").css("display", "none");
            }

            // Reset navigation arrows to normal behaviour
            navigation.find("span").removeClass("show").css("display","");

            // Trigger slide advace event
            $(window).trigger("slide-advance");

            // Fade out project title
            $(window).trigger("projecttitle-fadeout", next);
         })
         // Trigger goto
         .on("goto", function (e, index) {
            var next = slides.get(index),
               nextIndex = index;

            slideshow.trigger("goto-internal", next, nextIndex);

         })
         // Trigger next slide
         .on("next", function () {
            var current = slides.filter(".current"),
               next = current.next(".slide");

            if (next.length==0) {
               return;
            }

            slideshow.trigger("goto-internal", next);

         })
         // Trigger previous slide
         .on("prev", function () {
            var current = slides.filter(".current"),
               next = current.prev(".slide");

            if (next.length==0) {
               return;
            }

            slideshow.trigger("goto-internal", next);

         })
         .on("touchstart", function (e) {
            if ($(e.target).is("a") || $(e.target).closest(".navigation-arrow").length) {
               return;
            }
            var event = e.originalEvent;
            e.preventDefault();
            touchStartX = orientation=="vertical" ? event.touches[0].pageY : event.touches[0].pageX;
            touchStartY = orientation=="vertical" ? event.touches[0].pageX : event.touches[0].pageY;
         })
         .on("touchmove", function (e) {
            if ($(e.target).is("a")) {
               return;
            }
            var event = e.originalEvent;
            e.preventDefault();
            var touchEnd = event.changedTouches[0],
               deltaX = (orientation=="vertical" ? touchEnd.pageY : touchEnd.pageX) - touchStartX,
               deltaY = (orientation=="vertical" ? touchEnd.pageX : touchEnd.pageY) - touchStartY;
            if (deltaX==0 || Math.abs(deltaX)<Math.abs(deltaY)) {
               return;
            }
            if(!slideshow.hasClass("is-automated")) {
               if (deltaX<-50) {
                  // Swiped left

                  slideshow.trigger("next");
               } else if (deltaX>50){
                  // Swiped right
                  slideshow.trigger("prev");
               }
            }
         });
   });
};

// From http://forum.jquery.com/topic/jquery-jquery-way-for-filtering-self-all-children
$.fn.findAndSelf = function(selector) {
   return this.find(selector).andSelf().filter(selector);
}

function initSlideshow(context) {
   context.findAndSelf(".slideshow").slideshow();

   // Bind events on slideshow
   context.findAndSelf(".slideshow").each(function () {
      var slideshow = $(this);
      var nowScrolling = false;
      var timeout = false;

      slideshow
         .on("click", ".navigation .next", function (e) {
            if(!slideshow.hasClass("is-automated")) {
               slideshow.trigger("next");
            }
            e.preventDefault();
         })
         .on("click", ".navigation .prev", function (e) {
            if(!slideshow.hasClass("is-automated")) {
               slideshow.trigger("prev");
            }
            e.preventDefault();
         })
         // Navigate when scrolling
         .on("mousewheel", function (event, delta, deltaX, deltaY) {
            var ourDelta = slideshow.hasClass("vertical")
               ? deltaY
               : -deltaX;

            if (ourDelta==0) {
               return;
            }
            if (!nowScrolling) {

               nowScrolling = true;

               if(!slideshow.hasClass("is-automated")) {
                  $(window).trigger("projecttitle-stopfading");
                  if (ourDelta<0) {
                     // Scrolling down
                     slideshow.trigger("next");
                  } else {
                     // Scrolling up
                     slideshow.trigger("prev");
                  }
               }

               timeout = setTimeout(function () {
                  nowScrolling = false;
               }, 1000);
            }
            return false;
         });
   });
}


$(function() {
   $("html").addClass(isTouch ? "is-touch" : "no-touch");

   var projecttitleDisplayDuration = 2000,
      navigationButtonDisplayDuration = 4000,
      fadeDuration = 750;

   // Overlay for table of contents, project info
   $(document)
      .on("click", "#menu a", function () {
         var url = $(this).attr("href");

         $.get(url, function (htmlIn) {
            // Strip JavaScript blocks from input HTML
            var html = $("<div/>").append(htmlIn.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ""));

            // Remove old overlays
            $("#overlay-content, #overlay-extension").remove();
            $("body").removeClass("overlay-open, second-overlay-open");

            html.find(".content")
               .attr("id", "overlay-content")
               .hide()
               .appendTo("body")
               .fadeIn(duration);

            $("body").addClass("overlay-open");

            // Close overlay
            $(".button-back").on("click", function () {
               $("#overlay-content")
                  .fadeOut(duration, function () {
                     $(this).remove();
                  });
               $("body").removeClass("overlay-open");
               return false;
            });
         });
         return false;
      });

   // (Second) overlay for pages
   $(document)
      .on("click", ".toc .pages a", function () {
         var url = $(this).attr("href"),
            index = $(this).attr("data-index");

         $.get(url, function (htmlIn) {
            // Strip JavaScript blocks from input HTML
            var html = $("<div/>").append(htmlIn.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ""));

            if ($("body").hasClass("second-overlay-open")) {
               $(".pages-slideshow").trigger("goto", index);
            } else {
               $("#overlay-extension").remove();

               var content = html.find(".pages-slideshow");

               content
                  .attr("id", "overlay-extension")
                  .insertBefore("#overlay-content")
                  .animate({"margin-top": 0}, fadeDuration, function () {
                     $(".pages-slideshow").trigger("goto", index);
                  });

               initSlideshow(content);

               $("body").addClass("second-overlay-open");
            }


            // Close both overlays
            $(".button-back").on("click", function () {
               $("#overlay-content, #overlay-extension")
                  .fadeOut(duration, function () {
                     $(this).remove();
                  });
               $("body").removeClass("overlay-open second-overlay-open");
               return false;
            });
         });

         return false;
      });

   // Close overlay when user clicks on background or starts scrolling
   $(document)
      .on("click", ".fullscreen-image", function () {
         $("#overlay-content")
            .fadeOut(duration, function () {
               $(this).remove();
            });
         $("body").removeClass("overlay-open");
      });

   // Make toc functional > scroll to clicked project
   $(document)
      .on("click", ".toc .projects a", function () {
         var index = $(this).attr("data-index");
         // Remove horizontal slideshow
         $(".ajax-loaded").remove();
         $("#projects-slideshow .navigation-vertical")
               .css({"opacity": 1, "display": ""});

         // Remove pages slideshow
         $("#overlay-extension")
            .fadeOut(duration, function () {
               $(this).remove();
            });
         $("body").removeClass("projects-slideshow-open second-overlay-open");

         // Scroll to clicked project
         $("#projects-slideshow").trigger("goto", index);

         // Show vertical navigation
         $("#projects-slideshow .navigation-vertical")
            .css("opacity", 1);

         return false;
      })

   // Adjust font size and centering of logo/project title
   var originalMarginTopLogo = parseInt($("#logo").css("margin-top")),
      originalMarginTopTitle = parseInt($(".project-title").css("margin-top"));

   $(window)
      .on("resize", function () {
         // Calculate factor for font resizing
         var originalWindowDiagonal = Math.sqrt(1200*1200 + 800*800),
            windowHeight = $(window).height(),
            windowWidth = $(window).width(),
            windowDiagonal = Math.sqrt(windowHeight * windowHeight + windowWidth * windowWidth),
            fontResizeFactor = windowDiagonal / originalWindowDiagonal;
         // Assign new font size
         $("body").css({"font-size": fontResizeFactor * 100 + "%"});

         // Assign new margin top for centering project title vertically
         $("#logo").css({"margin-top": originalMarginTopLogo * fontResizeFactor + "px"});
         $(".fullscreen-image .project-title").css({"margin-top": originalMarginTopTitle * fontResizeFactor + 2 + "px"});

      })
      .trigger("resize");

   initSlideshow($("body"));

   $(".slideshow").each(function () {
      var slideshow = $(this);
      var nowScrolling = false;
      var timeout = false;

      // Load project slideshow (horizontal slideshow) with Ajax
      slideshow
         .on("click", ".navigation .project-link, .slide .project-title a", function () {

            // Close overlay if there is one
            $("#overlay-content")
               .fadeOut(duration, function () {
                  $(this).remove();
               });
            $("body").removeClass("overlay-open");

            // Fade out project title
            $(window).trigger("projecttitle-fadeout");

            var url = this.href ? this.href : $(this).attr("data-href");

            $.get(url, function (htmlIn) {
               // Strip JavaScript blocks from input HTML
               var html = $("<div/>").append(htmlIn.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")),
                  content = html.find(".slideshow.horizontal");

               content
                  .addClass("ajax-loaded")
                  .appendTo("body");

               $("body").addClass("projects-slideshow-loading");

               // Show image only when it is fully loaded
               var loadedImages = 0,
                  firstThreeSlides = content.find(".fullscreen-image:lt(3)"),
                  otherSlides = content.find(".fullscreen-image:gt(2)");

               // Load first 3 slides before showing slideshow
               firstThreeSlides
                  .each( function () {
                     var el = $(this),
                        img = new Image();
                     img.onload = function () {
                        loadedImages = loadedImages + 1;
                        el.fadeTo(duration, 1);
                        if (loadedImages == firstThreeSlides.length) {
                           $("body").removeClass("projects-slideshow-loading");
                           content.animate({"left": 0}, slideshowDuration, function () {
                              $("#close-button").show();
                           });

                        }
                     };
                     img.src = el.data("img-src");
                  });

               // Make slides visible
               otherSlides
                  .each( function () {
                     $(this).fadeTo(fadeDuration, 1);
                  });

               $("body").addClass("projects-slideshow-open");

               initSlideshow(content);
            });
            return false;
         });
   });

   // Fade in / fade out project title
   $(window)
      .on("projecttitle-stopfading", function (e, slide) {
         $(".project-title", slide)
            .queue([]);
      })
      .on("projecttitle-fadeout", function (e, slide) {
         var start;
         $(".project-title", slide)
            .delay(projecttitleDisplayDuration)
            .fadeTo(fadeDuration, 0);
      })
      .on("projecttitle-fadein", function (e, slide) {
         $(".project-title", slide)
            .css("opacity", 1);
      });

   // Close horizontal slideshow
   $(document)
      .on("click", "#close-button, .navigation-horizontal .back", function () {
         // Remove horizontal slideshow
         $(".ajax-loaded").animate({"left": "100%"}, slideshowDuration, function () {
            $(this).remove();
            $("body").removeClass("projects-slideshow-open");
            $("#projects-slideshow .navigation-vertical")
               .css({"opacity": 1, "display": ""});
         });

         // Set project link url
         var current = $(".slideshow.vertical .slide.current");
         $(".navigation .project-link").attr("data-href", current.attr("data-secimg-href")).show();
         return false;
      });

   // Show image only when it is fully loaded
   var loadedImages = 0;
   $(".fullscreen-image")
      .css("opacity", 0)
      .each(function () {
         var el = $(this),
            img = new Image();
         img.onload = function () {
            loadedImages = loadedImages + 1;
            el.fadeTo(fadeDuration, 1);
            if (loadedImages == $(".fullscreen-image").length) {
               setTimeout(function () {
                  $(window).trigger("projecttitle-fadeout");
               }, fadeDuration);
               $("#projects-slideshow")
                  .animate({"margin-top": 0}, fadeDuration, function () {
                     $("#projects-slideshow")
                        .find(".navigation")
                           .fadeTo(0, 1, function () {
                              $(".navigation-arrow:visible span").each(function () {
                                 var span = $(this);
                                 span.css("opacity", 0)
                                    .addClass("show")
                                    .fadeTo(fadeDuration, 1)
                                    .data("timeout-handler", setTimeout(function () {
                                       span
                                          .fadeTo(fadeDuration, 0, function () {
                                             span
                                                .removeClass("show")
                                                .css({"opacity": "", "display": ""});
                                          });
                                    }, navigationButtonDisplayDuration));
                              });
                           });
                  });
               $("#menu").fadeIn(fadeDuration);
            }
         };
         img.src = el.data("img-src");
      });

   $(window).on("slide-advance", function () {
      // Make sure navigation buttons donâ€™t get hidden when weâ€™ve advanced to next slide
      $(".navigation-arrow span").each(function () {
         var span = $(this);

         clearTimeout(span.data("timeout-handler"));
         span
            .removeClass("show")
            .css({"opacity": "", "display": ""});

      });

      $(window).trigger("projecttitle-stopfading");
   });

   $(document)
      .on("click", ".clickable-block", function (e) {
         if ($(e.target).is("a")) {
            return;
         }
         var href = $(this).data("href");
         if (href) {
            location.href = href;
            return false;
         }
      });

   $("a")
      .filter(function() {
         return this.hostname && this.hostname!=location.hostname;
      })
      .click(function (e) {
         this.blur();
         window.open(this.href);
         e.preventDefault();
      });
});