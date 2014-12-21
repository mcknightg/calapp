// Create a new MongoDB collection for calendar events

// Set session defaults
Session.setDefault('editing_calevent', null);
Session.setDefault('showEditEvent', false);

Template.calendar.showEditEvent = function(){
	return Session.get('showEditEvent');
}

Template.editEvent.evt = function(){
	// run a query to the database
	var calEvent = CalEvents.findOne({_id:Session.get('editing_calevent')});
	return calEvent;
}

var updateCalendar = function(){
	$('#calendar').fullCalendar( 'refetchEvents' );
}

// If something with a class of .save in the editEvent template is clicked, run this function
Template.editEvent.events({
	'click .save':function(evt,tmpl){
		updateCalEvent(Session.get('editing_calevent'),tmpl.find('.title').value);
		Session.set('editing_calevent',null);
		Session.set('showEditEvent',false);
		},
	'click .close':function(evt,tmpl){
		Session.set('editing_calevent',null);
		Session.set('showEditEvent',false);
		$('#EditEventModal').modal("hide");
	}	,
	'click .remove':function(evt,tmpl){
		removeCalEvent(Session.get('editing_calevent'));
		Session.set('editing_calevent',null);
		Session.set('showEditEvent',false);
		$('#EditEventModal').modal("hide");
	}
})

// Fullcalendar package
// As soon as the calendar renders, it has to execute this function
Template.calendar.rendered = function(){
	$('#calendar').fullCalendar({
		header:{
			left: 'prev,next today',
			center: 'title',
			right: 'month,basicWeek,basicDay'
		},
		// Event triggered when someone clicks on a day in the calendar
		dayClick:function( date, allDay, jsEvent, view) {
			// Insert the day someone's clicked on
			CalEvents.insert({title:'New Item',start:date,end:date});
			// Refreshes the calendar
			updateCalendar();
		},
		eventClick:function(calEvent,jsEvent,view){
			// Set the editing_calevent variable to equal the calEvent.id
			Session.set('editing_calevent',calEvent.id);
			// Set the showEditEvent variable to true
			Session.set('showEditEvent', true);
			//Trigger the modal bootstrap 3 box as defined in the calendar.html page
			$('#EditEventModal').modal("show");
		},
		eventDrop:function(calEvent){
			CalEvents.update(calEvent.id, {$set: {start:calEvent.start,end:calEvent.end}});
			updateCalendar();
		},
		events: function(start, end, callback) {
			// Create an empty array to store the events
			var events = [];
			// Variable to pass events to the calendar
			// Gets us all of the calendar events and puts them in the array
			calEvents = CalEvents.find();
			// Do a for each loop and add what you find to events array
			calEvents.forEach(function(evt){
				events.push({	id:evt._id,title:evt.title,start:evt.start,end:evt.end});
			})
			
			// Callback to pass events back to the calendar
			callback(events);
		},
		editable:true
	});
}
var removeCalEvent = function(id,title){
	CalEvents.remove({_id:id});
	updateCalendar();
 } 
var updateCalEvent = function(id,title){
	CalEvents.update(id, {$set: {title:title}});
	updateCalendar();
 }
