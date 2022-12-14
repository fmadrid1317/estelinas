import { OnInit, Component } from '@angular/core';
declare var jQuery: any;
declare var thisVar:any;

@Component({
  selector: 'app-picture-page',
  templateUrl: './picture-page.component.html',
  styleUrls: ['./picture-page.component.css']
})
export class PicturePageComponent implements OnInit {

  name = 'Angular';

  ngOnInit(): void {
    (function($){
      $(document).on('ready',function(){
        var timelines = $('.cd-horizontal-timeline'),
          eventsMinDistance = 60;
      
        (timelines.length > 0) && initTimeline(timelines);
        
        type timelineOptions = {
          [key: string]: any
        }
        
  
      
        function initTimeline(this : any, timelines:any) {
          thisVar = this;
          timelines.each(function(){
            var timeline = $(thisVar);
             var timelineComponents:timelineOptions = {};
            //cache timeline components 
            timelineComponents['timelineWrapper'] = timeline.find('.events-wrapper');
            timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].children('.events');
            timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].children('.filling-line');
            timelineComponents['timelineEvents'] = timelineComponents['eventsWrapper'].find('a');
            timelineComponents['timelineDates'] = parseDate(timelineComponents['timelineEvents']);
            timelineComponents['eventsMinLapse'] = minLapse(timelineComponents['timelineDates']);
            timelineComponents['timelineNavigation'] = timeline.find('.cd-timeline-navigation');
            timelineComponents['eventsContent'] = timeline.children('.events-content');
      
            //assign a left postion to the single events along the timeline
            setDatePosition(timelineComponents, eventsMinDistance);
            //assign a width to the timeline
            var timelineTotWidth = setTimelineWidth(timelineComponents, eventsMinDistance);
            //the timeline has been initialize - show it
            timeline.addClass('loaded');
      
            //detect click on the next arrow
            timelineComponents['timelineNavigation'].on('click', '.next', function(event:any){
              event.preventDefault();
              updateSlide(timelineComponents, timelineTotWidth, 'next');
            });
            //detect click on the prev arrow
            timelineComponents['timelineNavigation'].on('click', '.prev', function(event:any){
              event.preventDefault();
              updateSlide(timelineComponents, timelineTotWidth, 'prev');
            });
            //detect click on the a single event - show new event content
            timelineComponents['eventsWrapper'].on('click', 'a', function(event:any){
              event.preventDefault();
              timelineComponents['timelineEvents'].removeClass('selected');
              $(thisVar).addClass('selected');
              updateOlderEvents($(thisVar));
              updateFilling($(thisVar), timelineComponents['fillingLine'], timelineTotWidth);
              updateVisibleContent($(thisVar), timelineComponents['eventsContent']);
            });
      
            //on swipe, show next/prev event content
            timelineComponents['eventsContent'].on('swipeleft', function(){
              var mq = checkMQ();
              ( mq == 'mobile' ) && showNewContent(timelineComponents, timelineTotWidth, 'next');
            });
            timelineComponents['eventsContent'].on('swiperight', function(){
              var mq = checkMQ();
              ( mq == 'mobile' ) && showNewContent(timelineComponents, timelineTotWidth, 'prev');
            });
      
            //keyboard navigation
            $(document).keyup(function(event:any){
              if(event.key =="ArrowLeft" && elementInViewport(timeline.get(0)) ) {
                showNewContent(timelineComponents, timelineTotWidth, 'prev');
              } else if( event.key == "ArrowRight" && elementInViewport(timeline.get(0))) {
                showNewContent(timelineComponents, timelineTotWidth, 'next');
              }
            });
          });
        }
      
        function updateSlide(timelineComponents:any, timelineTotWidth:any, string:any) {
          //retrieve translateX value of timelineComponents['eventsWrapper']
          var translateValue = getTranslateValue(timelineComponents['eventsWrapper']),
            wrapperWidth = Number(timelineComponents['timelineWrapper'].css('width').replace('px', ''));
          //translate the timeline to the left('next')/right('prev') 
          (string == 'next') 
            ? translateTimeline(timelineComponents, translateValue - wrapperWidth + eventsMinDistance, wrapperWidth - timelineTotWidth)
            : translateTimeline(timelineComponents, translateValue + wrapperWidth - eventsMinDistance);
        }
      
        function showNewContent(timelineComponents:any, timelineTotWidth:any, string:any) {
          //go from one event to the next/previous one
          var visibleContent =  timelineComponents['eventsContent'].find('.selected'),
            newContent = ( string == 'next' ) ? visibleContent.next() : visibleContent.prev();
      
          if ( newContent.length > 0 ) { //if there's a next/prev event - show it
            var selectedDate = timelineComponents['eventsWrapper'].find('.selected'),
              newEvent = ( string == 'next' ) ? selectedDate.parent('li').next('li').children('a') : selectedDate.parent('li').prev('li').children('a');
            
            updateFilling(newEvent, timelineComponents['fillingLine'], timelineTotWidth);
            updateVisibleContent(newEvent, timelineComponents['eventsContent']);
            newEvent.addClass('selected');
            selectedDate.removeClass('selected');
            updateOlderEvents(newEvent);
            updateTimelinePosition(string, newEvent, timelineComponents, timelineTotWidth);
          }
        }
      
        function updateTimelinePosition(string:any, event:any, timelineComponents:any, timelineTotWidth:number) {
          //translate timeline to the left/right according to the position of the selected event
          var eventStyle = window.getComputedStyle(event.get(0), null),
            eventLeft = Number(eventStyle.getPropertyValue("left").replace('px', '')),
            timelineWidth = Number(timelineComponents['timelineWrapper'].css('width').replace('px', '')),
            timelineTotWidth = Number(timelineComponents['eventsWrapper'].css('width').replace('px', ''));
          var timelineTranslate = getTranslateValue(timelineComponents['eventsWrapper']);
      
              if( (string == 'next' && eventLeft > timelineWidth - timelineTranslate) || (string == 'prev' && eventLeft < - timelineTranslate) ) {
                translateTimeline(timelineComponents, - eventLeft + timelineWidth/2, timelineWidth - timelineTotWidth);
              }
        }
      
        function translateTimeline(timelineComponents:any, value:any, totWidth?:any) {
          var eventsWrapper = timelineComponents['eventsWrapper'].get(0);
          value = (value > 0) ? 0 : value; //only negative translate value
          value = ( !(typeof totWidth === 'undefined') &&  value < totWidth ) ? totWidth : value; //do not translate more than timeline width
          setTransformValue(eventsWrapper, 'translateX', value+'px');
          //update navigation arrows visibility
          (value == 0 ) ? timelineComponents['timelineNavigation'].find('.prev').addClass('inactive') : timelineComponents['timelineNavigation'].find('.prev').removeClass('inactive');
          (value == totWidth ) ? timelineComponents['timelineNavigation'].find('.next').addClass('inactive') : timelineComponents['timelineNavigation'].find('.next').removeClass('inactive');
        }
      
        function updateFilling(selectedEvent:any, filling:any, totWidth:any) {
          //change .filling-line length according to the selected event
          var eventStyle = window.getComputedStyle(selectedEvent.get(0), null),
            eventLeft:any = eventStyle.getPropertyValue("left"),
            eventWidth = eventStyle.getPropertyValue("width");
          eventLeft = Number(eventLeft.replace('px', '')) + Number(eventWidth.replace('px', ''))/2;
          var scaleValue = eventLeft/totWidth;
          setTransformValue(filling.get(0), 'scaleX', scaleValue);
        }
      
        function setDatePosition(timelineComponents:any, min:any) {
          for (var i = 0; i < timelineComponents['timelineDates'].length; i++) { 
              var distance = daydiff(timelineComponents['timelineDates'][0], timelineComponents['timelineDates'][i]),
                distanceNorm = Math.round(distance/timelineComponents['eventsMinLapse']) + 2;
              timelineComponents['timelineEvents'].eq(i).css('left', distanceNorm*min+'px');
          }
        }
      
        function setTimelineWidth(timelineComponents:any, width:any) {
          var timeSpan = daydiff(timelineComponents['timelineDates'][0], timelineComponents['timelineDates'][timelineComponents['timelineDates'].length-1]),
            timeSpanNorm = timeSpan/timelineComponents['eventsMinLapse'],
            timeSpanNorm = Math.round(timeSpanNorm) + 4,
            totalWidth = timeSpanNorm*width;
          timelineComponents['eventsWrapper'].css('width', totalWidth+'px');
          updateFilling(timelineComponents['timelineEvents'].eq(0), timelineComponents['fillingLine'], totalWidth);
        
          return totalWidth;
        }
      
        function updateVisibleContent(event:any, eventsContent:any) {
          var eventDate = event.data('date'),
            visibleContent = eventsContent.find('.selected'),
            selectedContent = eventsContent.find('[data-date="'+ eventDate +'"]'),
            selectedContentHeight = selectedContent.height();
      
          if (selectedContent.index() > visibleContent.index()) {
            var classEnetering = 'selected enter-right',
              classLeaving = 'leave-left';
          } else {
            var classEnetering = 'selected enter-left',
              classLeaving = 'leave-right';
          }
      
          selectedContent.attr('class', classEnetering);
          visibleContent.attr('class', classLeaving).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
            visibleContent.removeClass('leave-right leave-left');
            selectedContent.removeClass('enter-left enter-right');
          });
          eventsContent.css('height', selectedContentHeight+'px');
        }
      
        function updateOlderEvents(event:any) {
          event.parent('li').prevAll('li').children('a').addClass('older-event').end().end().nextAll('li').children('a').removeClass('older-event');
        }
      
        function getTranslateValue(timeline:any) {
          var translateValue;
          var timelineStyle = window.getComputedStyle(timeline.get(0), null),
            timelineTranslate:any = timelineStyle.getPropertyValue("-webkit-transform") ||
                   timelineStyle.getPropertyValue("-moz-transform") ||
                   timelineStyle.getPropertyValue("-ms-transform") ||
                   timelineStyle.getPropertyValue("-o-transform") ||
                   timelineStyle.getPropertyValue("transform");
      
              if( timelineTranslate.indexOf('(') >=0 ) {
                var timelineTranslate = timelineTranslate.split('(')[1];
              timelineTranslate = timelineTranslate.split(')')[0];
              timelineTranslate = timelineTranslate.split(',');
              translateValue = timelineTranslate[4];
              } else {
                translateValue = 0;
              }
      
              return Number(translateValue);
        }
      
        function setTransformValue(element:any, property:any, value:any) {
          element.style["-webkit-transform"] = property+"("+value+")";
          element.style["-moz-transform"] = property+"("+value+")";
          element.style["-ms-transform"] = property+"("+value+")";
          element.style["-o-transform"] = property+"("+value+")";
          element.style["transform"] = property+"("+value+")";
        }
      
        //based on http://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
        function parseDate(events:any) {
          var dateArrays:Array<any> = [];
          events.each(function(){
            var dateComp = $(thisVar).data('date').split('/'),
              newDate = new Date(dateComp[2], dateComp[1]-1, dateComp[0]);
            dateArrays.push(newDate);
          });
            return dateArrays;
        }
      
        function parseDate2(events:any) {
          var dateArrays:Array<any> = [];
          events.each(function(){
            var singleDate = $(thisVar),
             dayComp:any,
             timeComp:any,
              dateComp = singleDate.data('date').split('T');
            if( dateComp.length > 1 ) { //both DD/MM/YEAR and time are provided
                dayComp = dateComp[0].split('/'),
                timeComp = dateComp[1].split(':');
            } else if( dateComp[0].indexOf(':') >=0 ) { //only time is provide
                dayComp = ["2000", "0", "0"],
                timeComp = dateComp[0].split(':');
            } else { //only DD/MM/YEAR
                dayComp = dateComp[0].split('/'),
                timeComp = ["0", "0"];
            }
            var	newDate = new Date(dayComp[2], dayComp[1]-1, dayComp[0], timeComp[0], timeComp[1]);
            dateArrays.push(newDate);
          });
            return dateArrays;
        }
      
        function daydiff(first:any, second:any) {
            return Math.round((second-first));
        }
      
        function minLapse(dates:any) {
          //determine the minimum distance among events
          var dateDistances = [];
          for (var i = 1; i < dates.length; i++) { 
              var distance = daydiff(dates[i-1], dates[i]);
              dateDistances.push(distance);
          }
          return Math.min.apply(null, dateDistances);
        }
      
        /*
          How to tell if a DOM element is visible in the current viewport?
          http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
        */
        function elementInViewport(el:any) {
          var top = el.offsetTop;
          var left = el.offsetLeft;
          var width = el.offsetWidth;
          var height = el.offsetHeight;
      
          while(el.offsetParent) {
              el = el.offsetParent;
              top += el.offsetTop;
              left += el.offsetLeft;
          }
      
          return (
              top < (window.pageYOffset + window.innerHeight) &&
              left < (window.pageXOffset + window.innerWidth) &&
              (top + height) > window.pageYOffset &&
              (left + width) > window.pageXOffset
          );
        }
      
        function checkMQ() {
          //check if mobile or desktop device
          return window.getComputedStyle(document.querySelector('.cd-horizontal-timeline') as HTMLElement, '::before').getPropertyValue('content').replace(/'/g, "").replace(/"/g, "");
        }
      });

    })(jQuery);
    
  }

}
