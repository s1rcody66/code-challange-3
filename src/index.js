// Your code here
const baseURL = "http://localhost:3000";

fetch(`${baseURL}/films`)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response failed.");
    }
    return response.json();
  })
  .then((data) => {
    console.log("Film data", data);
    generateFilmMenu(data);
  })
  .catch((error) => {
    console.error("Unable to fetch the film data", error);
  });

function generateFilmMenu(films) {
  const filmsList = document.getElementById("films");
  filmsList.innerHTML = "";

  films.forEach((film) => {
    const listItem = document.createElement("li");
    const availableTickets = getAvailableTickets(
      film.capacity - film.tickets_sold
    );
    const posterContainer = document.createElement("div");
    posterContainer.classList.add("poster-container");

    const posterImage = new Image();
    posterImage.src = film.poster_url;
    posterImage.alt = `${film.title} Poster`;
    posterImage.style.maxWidth = "100px";

    listItem.innerHTML = `
        <div>
          <span>${film.title}</span>
          <span>(${film.runtime} minutes)</span>
          <span>Showtime: ${film.showtime}</span>
          <span class="available-tickets">Available Tickets: ${availableTickets}</span>
          <button class="buy-ticket-button" data-id="${film.id}">${
      availableTickets > 0 ? "Buy Ticket" : "Sold Out"
    }</button>
          <button class="delete-film-button">Delete Film</button>
        </div>`;

    listItem.appendChild(posterImage);

    if (availableTickets === 0) {
      listItem.classList.add("sold-out");
    }

    listItem.addEventListener("click", () => {
      const movieId = film.id;

      fetch(`${baseURL}/films/${movieId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response failed.");
          }
          return response.json();
        })
        .then((data) => {
          document.getElementById("title").textContent = data.title;
          document.getElementById(
            "runtime"
          ).textContent = `Runtime: ${data.runtime} minutes`;
          document.getElementById(
            "showtime"
          ).textContent = `Showtime: ${data.showtime}`;
          document.getElementById(
            "description"
          ).textContent = `Description: ${data.description}`;
          document.getElementById(
            "availableTickets"
          ).textContent = `Available Tickets: ${getAvailableTickets(
            data.capacity,
            data.tickets_sold
          )}`;
          const posterContainer = listItem.querySelector(".poster-container");
          const posterImage = document.createElement("img");
          posterImage.src = data.poster_url;
          posterImage.alt = `${data.title} Poster`;
          posterImage.style.maxWidth = "100px";

          posterContainer.innerHTML = "";

          posterContainer.appendChild(posterImage);
        })
        .catch((error) => {
          console.error("Unable to fetch the movie details", error);
        });
    });
    listItem
      .querySelector(".buy-ticket-button")
      .addEventListener("click", (event) => {
        event.stopPropagation();
        buyTicket(event);
      });

    listItem
      .querySelector(".delete-film-button")
      .addEventListener("click", (event) => {
        event.stopPropagation();
        deleteFilm(film.id);
      });

    filmsList.appendChild(listItem);
  });
}

function buyTicket(event) {
  const movieId = event.target.dataset.id;
  fetch(`${baseURL}/films/${movieId}/buyTicket`, {
    method: "POST",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to buy ticket");
      }
      return response.json();
    })
    .then((data) => {
      fetch(`${baseURL}/films/${movieId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response failed.");
          }
          return response.json();
        })
        .then((movieData) => {
          const listItem = document.querySelector(`li[data-id="${movieId}"]`);
          const availableTicketsElement =
            listItem.querySelector(".available-tickets");
          availableTicketsElement.textContent = `Available Tickets: ${getAvailableTickets(
            movieData.capacity,
            movieData.tickets_sold
          )}`;

          if (movieData.tickets_sold === movieData.capacity) {
            listItem.classList.add("sold-out");
            listItem.querySelector(".buy-ticket-button").textContent =
              "Sold Out";
          }
        })
        .catch((error) => {
          console.error("Unable to fetch movie data after purchase", error);
        });
    })
    .catch((error) => {
      console.error("Error buying ticket", error);
    });
}

function deleteFilm(filmId) {
  fetch(`${baseURL}/films/${filmId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete film");
      }
      console.log("Film deleted successfully");
    })
    .catch((error) => {
      console.error("Error deleting film:", error);
    });
}

function getAvailableTickets(capacity, ticketsSold) {
  return capacity - ticketsSold;
}

