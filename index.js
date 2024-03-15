const eventsAPI = (function () {
  const API_URL = "http://localhost:3000/events";

  async function getEvents() {
    return fetch(API_URL).then((res) => res.json());
  }

  async function addEvent(newEvent) {
    return fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName: newEvent.eventName,
        startDate: newEvent.startDate,
        endDate: newEvent.endDate,
      }),
    }).then((res) => res.json());
  }

  async function updateEvent(id, updatedEvent) {
    return fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName: updatedEvent.eventName,
        startDate: updatedEvent.startDate,
        endDate: updatedEvent.endDate,
      }),
    }).then((res) => res.json());
  }

  async function deleteEvent(id) {
    return fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  }

  return {
    getEvents,
    addEvent,
    updateEvent,
    deleteEvent,
  };
})();

class EventsView {
  constructor() {
    this.newEventForm = document.querySelector(".new-event-form");
    this.eventNameInput = document.querySelector("#event-name");
    this.startDateInput = document.querySelector("#event-start");
    this.endDateInput = document.querySelector("#event-end");
    this.eventList = document.querySelector(".event-list");
  }

  clearInput() {
    this.eventNameInput.value = "";
    this.startDateInput.value = "";
    this.endDateInput.value = "";
  }

  renderEvents(events) {
    this.eventList.innerHTML = "";
    events.forEach((event) => {
      this.renderNewEvent(event);
    });
  }

  removeEventElem(id) {
    document.getElementById(id).remove();
  }

  renderNewEvent(newEvent) {
    this.eventList.appendChild(this.createEventElement(newEvent));
  }

  createEventElement(event) {
    const eventElement = document.createElement("div");
    eventElement.classList.add("event");
    eventElement.setAttribute("id", event.id);
    eventElement.innerHTML = `
      <div class="event__name">${event.eventName}</div>
      <div class="event__dates">${event.startDate} - ${event.endDate}</div>
      <div class="event__actions">
        <button class="event__del-btn">Delete</button>
        <button class="event__edit-btn">Edit</button>
      </div>`;
    return eventElement;
  }
}

class EventsModel {
  constructor(events = []) {
    this.events = events;
  }

  getEvents() {
    return this.events;
  }

  setEvents(newEvents) {
    this.events = newEvents;
  }

  addEvent(newEvent) {
    this.events.push(newEvent);
  }

  deleteEvent(id) {
    this.events = this.events.filter((event) => event.id !== id);
  }
}

class EventsController {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.init();
  }

  init() {
    this.setUpEvents();
    this.fetchEvents();
  }

  setUpEvents() {
    this.setUpSubmitEvent();
    this.setUpDeleteEvent();
  }

  async fetchEvents() {
    const events = await eventsAPI.getEvents();
    this.model.setEvents(events);
    this.view.renderEvents(events);
  }

  setUpDeleteEvent() {
    this.view.eventList.addEventListener("click", async (e) => {
      if (e.target.classList.contains("event__del-btn")) {
        const eventElem = e.target.closest(".event");
        const deleteId = eventElem.getAttribute("id");
        await eventsAPI.deleteEvent(deleteId);
        this.model.deleteEvent(deleteId);
        this.view.removeEventElem(deleteId);
      }
    });
  }

  setUpSubmitEvent() {
    this.view.newEventForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newEvent = {
        eventName: this.view.eventNameInput.value,
        startDate: this.view.startDateInput.value,
        endDate: this.view.endDateInput.value,
      };
      if (!newEvent.eventName || !newEvent.startDate || !newEvent.endDate) {
        return;
      }

      const addedEvent = await eventsAPI.addEvent(newEvent);
      this.model.addEvent(addedEvent);
      this.view.renderNewEvent(addedEvent);
      this.view.clearInput();
    });
  }
}

const eventsView = new EventsView();
const eventsModel = new EventsModel();
const eventsController = new EventsController(eventsView, eventsModel);