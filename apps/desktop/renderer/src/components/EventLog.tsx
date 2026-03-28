interface Event {
  id: string;
  eventType: string;
  createdAt: string;
}

export function EventLog({ events }: { events: Event[] }): JSX.Element {
  return (
    <div className="event-log">
      <h3>Events</h3>
      <div className="event-list">
        {events.length === 0 && <div className="empty-event">No events yet</div>}
        {events.slice(0, 50).map((event) => (
          <div key={event.id} className="event-item">
            <span className="event-type">{event.eventType}</span>
            <span className="event-time">{new Date(event.createdAt).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}