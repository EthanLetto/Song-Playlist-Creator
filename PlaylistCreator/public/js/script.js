function getSong() {
  let songTitle = document.getElementById('songTitleTextField').value.trim();
  console.log('songTitle: ' + songTitle);
  if (songTitle === '') {
    return alert('Please enter a Song Title');
  }

  let songsDiv = document.getElementById('songs_div');
  songsDiv.innerHTML = '';

  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
        let response = JSON.parse(xhr.responseText);
        songsDiv.innerHTML = songsDiv.innerHTML + `<h1>Songs matching: ${songTitle} </h1><p>${xhr.responseText}</p>`;
    }
  };
  xhr.open('GET', `/songs?title=${songTitle}`, true);
  xhr.send();
}

// Attach Enter-key Handler
const ENTER = 13;

function handleKeyUp(event) {
  event.preventDefault();
  if (event.keyCode === ENTER) {
    document.getElementById("submit_button").click();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('submit_button').addEventListener('click', fetchiTunesData);
  
  // Add key handler for the document as a whole, not separate elements.
  document.addEventListener('keyup', handleKeyUp);
});

// Remove song from the playlist
function removeSong(button) {
  var row = button.parentNode.parentNode;
  row.parentNode.removeChild(row);
}

// Move song up in the playlist order
function moveUp(button) {
  var row = button.parentNode.parentNode;
  if (row.rowIndex > 1) {
    console.log('Moving up:', row.rowIndex);
    row.parentNode.insertBefore(row, row.previousSibling);
  }
}

// Move song down in the playlist order
function moveDown(button) {
  var row = button.parentNode.parentNode;
  var currentIndex = row.rowIndex;
  var totalRows = row.parentNode.rows.length;

  if (currentIndex < totalRows) {
    // Swap the current row with the next row
    var nextRow = row.nextElementSibling;
    row.parentNode.insertBefore(nextRow, row);

    // Log to the console for debugging
    console.log('Moved down:', currentIndex);
  }
}


// Function to fetch data from the iTunes API
function fetchiTunesData() {
  // Get the search term from the input field and trim any leading or trailing whitespace
  const searchTerm = document.getElementById('songTitleTextField').value.trim().replace(' ', '+');

  // Check if the searchTerm is not empty before making the API call
  if (searchTerm !== '') {
    const songsMatching = document.getElementById('songsMatching');
    if (songsMatching) {
      const displaySearchTerm = searchTerm.replace(/\+/g, ' ');
      songsMatching.textContent = `Songs Matching: ${displaySearchTerm}`;
    } else {
      console.error('Error: Could not find the matching song element.');
    }

    // Construct the API URL with the dynamic search term
    const apiUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song`;

    // Make the fetch request
    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
       // Call function to populate table with API data
      populateTable(data.results);
    })
    .catch(error => console.error('Error fetching iTunes data:', error));
  } else {
    console.log('Search term is empty. Please enter a valid term.');
  }
}


// Function to populate the table of song options
function populateTable(songs) {
  const tableBody = document.querySelector('#songsTable tbody');

  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild);
  }

  let hold = 0;
  for(const song of songs){
    const row = tableBody.insertRow();
    const buttons = row.insertCell(0);
    const songName = row.insertCell(1);
    const artist = row.insertCell(2);
    const img = row.insertCell(3);

    // Button with the character '+' in the first cell
    buttons.innerHTML = '<button id="addSong" onclick="addSongToPlaylist(event)">+</button>';

    // Title and Artist in the second and third cells
    songName.textContent = song.trackName;
    artist.textContent = song.artistName;
    img.setAttribute('img', song.artworkUrl100);
    img.innerHTML = `<img src="${song.artworkUrl100}" alt="Artwork" width="50" height="50">`;
    hold++;
    if(hold == 20){
      break;
    }
  }
}

// Helper function to get the parent row of the button
function getParentRow(element) {
  if (element.closest) {
    return element.closest('tr');
  } else {
    // Manually traverse up the DOM tree if closest is not available
    while (element && element.nodeName !== 'TR') {
      element = element.parentNode;
    }
    return element;
  }
}

// Add song to the playlist table
function addSongToPlaylist(event) {
  var button = event.target;
  var row = getParentRow(button);
  if (row) {
    // Extract information from the current row
    var title = row.cells[1].textContent;
    var artist = row.cells[2].textContent;
    var artworkUrl = row.cells[3].getAttribute('img');

    // Add a new row to the playlist table
    var playlistTableBody = document.getElementById("playlistTable");
    var newRow = playlistTableBody.insertRow();

    // Insert cells for action buttons, title, artist, and artwork
    var cellButtons = newRow.insertCell(0);
    cellButtons.innerHTML = '<button onclick="removeSong(this)">-</button> ' + '<button onclick="moveUp(this)">↑</button> ' + '<button onclick="moveDown(this)">↓</button>';

    var cellTitle = newRow.insertCell(1);
    cellTitle.textContent = title;

    var cellArtist = newRow.insertCell(2);
    cellArtist.textContent = artist;

    var cellArtwork = newRow.insertCell(3);
    cellArtwork.innerHTML = `<img src="${artworkUrl}" alt="Artwork" width="50" height="50">`;

    
    // Replace cell contents with '...'
    for (var i = 0; i < row.cells.length; i++) {
      row.cells[i].textContent = '...';
    }
  } else {
      console.error('Error: Unable to find parent row for the button.');
  }
}
