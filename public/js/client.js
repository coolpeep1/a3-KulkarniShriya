
function checkAuth() {
    const loggedIn = localStorage.getItem('loggedIn');
    const username = localStorage.getItem('username');
    if (!loggedIn && window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
        return false;
    }
    if (loggedIn && window.location.pathname === '/login.html') {
        window.location.href = '/index.html';
        return false;
    }
    //curr user
    const userDisplay = document.getElementById('currentUser');
    if (userDisplay && username) {
        userDisplay.textContent = username;
    }
    const unameInput = document.getElementById('uname');
    if (unameInput && username) {
        unameInput.value = username;
    }
    return true;
}

// Logout
function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    window.location.href = '/login.html';
}

// FRONT-END (CLIENT) JAVASCRIPT HERE
// when the web page loads, associate clicking on the button with the function submit().
window.onload = function () {
    if (!checkAuth()) return;

    // logging out
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.onclick = function(e) {
            e.preventDefault();
            logout();
        };
    }

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
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    });
    const data = await response.json();
    console.log("Response:", data);
    document.querySelector("#showForm").reset();
    // Reset username
    document.querySelector("#uname").value = localStorage.getItem('username');
}

const loadShows = async function() {
    const username = localStorage.getItem('username');
    const response = await fetch(`/shows?username=${username}`);
    const data = await response.json();
    displayShows(data);
}

const displayShows = function(shows) {
    const tableBody = document.querySelector("#showsTableBody");
    tableBody.innerHTML = "";
    if (shows.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No shows added yet, add one from the form!</td></tr>';
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
            <td>
                <button onclick="editShow('${show._id}')">Edit</button>
                <button onclick="deleteShow('${show._id}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// delete
async function deleteShow(id) {
    if (!confirm('Are you sure you want to delete this show?')) {
        return;
    }
    const username = localStorage.getItem('username');
    try {
        const response = await fetch(`/delete/${id}?username=${username}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            loadShows(); // Reload the list
        } else {
            alert('Error deleting show');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting show');
    }
}
//edit
async function editShow(id) {
    const username = localStorage.getItem('username');
    const response = await fetch(`/shows?username=${username}`);
    const shows = await response.json();
    const show = shows.find(s => s._id === id);

    if (!show) {
        alert('Show not found');
        return;
    }

    // Simple prompts for editing
    const newEpisodesWatched = prompt('Episodes watched:', show.EpisodesWatched);
    if (newEpisodesWatched === null) return; // cancel
    const updatedShow = {
        uname: username,
        title: show.title,
        genre: show.genre,
        SeasonCount: show.SeasonCount,
        EpisodeCount: show.EpisodeCount,
        EpisodesWatched: parseInt(newEpisodesWatched)
    };

    try {
        const response = await fetch(`/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedShow)
        });

        const data = await response.json();

        if (data.success) {
            loadShows();
        } else {
            alert('Show update error');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating show');
    }
}