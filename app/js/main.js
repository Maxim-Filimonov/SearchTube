var ticketmasterUrl = 'https://app.ticketmaster.com/discovery/v2/events'

function getData(comedian) {
    var cities = $('.cities').val();
    var options = {
        apikey: '6m1NAjVcdP4FZrAj7JShG7KDuGN6FlAN',
        keyword: comedian,
        city: cities,
    }

    return Promise.resolve($.getJSON(ticketmasterUrl, options));
}


function saveEvents(data) {
    if (data["_embedded"]) {
        state.events = data["_embedded"].events;
    } else {
        var nextComedian = state.getComedianPool.shift();
        getData(nextComedian).then(saveEvents);
    }
    render();
}
//Complete gathers up the arrays 
function complete() {
    var comedians =
        state.genres.map(function (x) {
            return x.comedians;
        })
    //This will combine every array into a single array
    //Refer to this repl https://repl.it/I0hd/0
    return Array.prototype.concat.apply([], comedians);
}

function sameGenre() {
    var message = "<p> Here are some recommendations! </p>"
    return message;
}

function renderRelatedComedians(comedians) {
    comedians = comedians.join(", ")
        .split("  ");
    $('.sameGenre').html(comedians);
    $('.description').html(sameGenre);

}

function onComedianSelected(e, selected) {
    var relatedComedians = state.getRelatedComedians(selected.item.value)
    //pool is a pool of comedians 
    state.getComedianPool = [];
    state.getComedianPool.push(selected.item.value)
    state.getComedianPool.push(state.currentComedian);
    state.getComedianPool = state.getComedianPool.concat(relatedComedians);


    renderRelatedComedians(relatedComedians);
}

function load() {
    $('#loader').show();
}

function render() {
    if (state.getComedianPool) {
        $('.searchTerm').val(state.getComedianPool[0]);

        renderRelatedComedians(state.getComedianPool.slice(1));
    }
    renderRelatedComedians
    //makes autocomplete possible 
    $('.searchTerm').autocomplete({
        source: complete(),
        select: onComedianSelected
    })
    $('#formData').submit(function (e) {
        $('h1').hide();
        e.preventDefault();
        load();
        getData(state.getComedianPool.shift()).then(saveEvents);
    });
    if (state.events) {
        state.events.map(renderTemplate);
    }
}

function renderEvent(x) {
    var url = state.events[0]._embedded.attractions[0].url;
    return x.name.link(url) + "<br/>" + " ";
}

function renderCity(x) {
    return x._embedded.venues[0].city.name + "<br/>" + " ";
}

function renderMap(x) {
    const lat = x._embedded.venues[0].location.latitude
    const long = x._embedded.venues[0].location.longitude
    const coordinates = lat + ',' + long;
    return '<img src="https://maps.google.com/maps/api/staticmap?center=' +
        coordinates +
        '&zoom=12&size=400x300&sensor=false" style="width: 100%; height: 400px;" />'
}


function renderEvents(events) {
    return events.map(renderEvent)
}

function renderVenue(x) {
    return x._embedded.venues[0].name + "<br/>" + " ";
}

function renderVenues(events) {
    return events.map(renderVenue)
}

function renderDate(x){
return x.dates.start.localDate; 
}

function renderTemplate(event) {
    $('#loader').hide();
    $('.venues').html("Event Name: " + renderEvent(event) + "Venue: " + renderVenue(event) + " City: " + renderCity(event) +
     "Event Date: " + renderDate(event));
    $('.venues')[0].scrollIntoView();
    $('#map').html(renderMap(state.events[0]))
}

render();