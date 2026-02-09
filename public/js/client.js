// FRONT-END (CLIENT) JAVASCRIPT HERE
// when the web page loads, associate clicking on the button with the function submit().
window.onload = function () {
    const form = document.querySelector("#showForm"); // check page
    const resultsTable = document.querySelector("#showsTable")
    //forms page
    if (form) {
          form.onsubmit = submit;

    }
    if(resultsTable){
        loadShows();
    }

}

const submit = async function (event) {
    event.preventDefault();
    //form vals
    const uname = document.querySelector("#uname").value;
    const title = document.querySelector("#title").value;
    const SeasonCount = parseInt(document.querySelector("#SeasonCount").value);
    const EpisodeCount = parseInt(document.querySelector("#EpisodeCount").value);
    const EpisodesWatched = parseInt(document.querySelector("#EpisodesWatched").value);
    const genreRadio = document.querySelector('input[name="genre"]:checked');
    const genre= genreRadio ? genreRadio.value:"";

    const json = {
        uname: uname,
        title: title,
        SeasonCount: SeasonCount,
        EpisodeCount: EpisodeCount,
        EpisodesWatched: EpisodesWatched,
        genre: genre
    };

    const body = JSON.stringify(json);

    const response = await fetch("/submit", {
        method: 'POST',
        body: body
    });
    const data = await response.json();
    console.log("Response:", data);
    document.querySelector("#showForm").reset();
}
const loadShows = async function() {
    const response = await fetch("/shows");
    const data = await response.json();
    displayShows(data);
}
const displayShows = function(shows) {
    const tableBody = document.querySelector("#showsTableBody");
    tableBody.innerHTML = ""; // Clear  rows

    if (shows.length === 0) {
        tableBody.innerHTML = '<tr>No shows added yet, add one from the form!</tr>';
        return;
    }
    shows.forEach(show => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${show.title}</td>
            <td>${show.genre}</td>
            <td>${show.EpisodesWatched} / ${show.totalEpisodes}</td>
            <td>${show.percentComplete}%</td>
            <td>${show.RemainingEpisodes}</td>
             `;
        tableBody.appendChild(row);
    });
}