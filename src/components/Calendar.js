import { useEffect, useState } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { findIana } from 'windows-iana';
import { AuthenticatedTemplate } from '@azure/msal-react';
import { add, format, getDay, parseISO } from 'date-fns';
import { endOfWeek, startOfWeek } from 'date-fns/esm';

import { getUserWeekCalendar } from '../GraphService';
import { useAppContext } from '../AppContext';
import CalendarDayRow from './CalendarDayRow';
import Debug from "./Debug";
import './Calendar.css';

const Calendar = (props) => {
  const app = useAppContext();
  const [events, setEvents] = useState();

  useEffect(() => {
    const loadEvents = async () => {
      if (app.user && !events) {
        try {
          const ianaTimeZones = findIana(app.user?.timeZone);
          const events = await getUserWeekCalendar(app.authProvider, ianaTimeZones[0].valueOf());
          setEvents(events);
        } catch (err) {
          app.displayError(err.message);
        }
      }
    };

    loadEvents();
  });

  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(weekStart);

  return (
    <AuthenticatedTemplate>
      <div className="mb-3">
        <h1 className="mb-3">{format(weekStart, 'MMMM d, yyyy')} - {format(weekEnd, 'MMMM d, yyyy')}</h1>
        <RouterNavLink to="/newevent" className="btn btn-dark btn-sm" exact>New event</RouterNavLink>
      </div>
      <div className="calendar-week">
        <div className="table-responsive">
          {events && <Table size="sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Event</th>
              </tr>
            </thead>
            <tbody>
              <CalendarDayRow
                date={weekStart}
                timeFormat={app.user?.timeFormat}
                events={events.filter(event => getDay(parseISO(event.start?.dateTime)) === 0)} />
              <CalendarDayRow
                date={add(weekStart, { days: 1 })}
                timeFormat={app.user?.timeFormat}
                events={events.filter(event => getDay(parseISO(event.start?.dateTime)) === 1)} />
              <CalendarDayRow
                date={add(weekStart, { days: 2 })}
                timeFormat={app.user?.timeFormat}
                events={events.filter(event => getDay(parseISO(event.start?.dateTime)) === 2)} />
              <CalendarDayRow
                date={add(weekStart, { days: 3 })}
                timeFormat={app.user?.timeFormat}
                events={events.filter(event => getDay(parseISO(event.start?.dateTime)) === 3)} />
              <CalendarDayRow
                date={add(weekStart, { days: 4 })}
                timeFormat={app.user?.timeFormat}
                events={events.filter(event => getDay(parseISO(event.start?.dateTime)) === 4)} />
              <CalendarDayRow
                date={add(weekStart, { days: 5 })}
                timeFormat={app.user?.timeFormat}
                events={events.filter(event => getDay(parseISO(event.start?.dateTime)) === 5)} />
              <CalendarDayRow
                date={add(weekStart, { days: 6 })}
                timeFormat={app.user?.timeFormat}
                events={events.filter(event => getDay(parseISO(event.start?.dateTime)) === 6)} />
            </tbody>
          </Table>}
        </div>
      </div>

      <Debug debugLabel="events" debugValue={events} />
    </AuthenticatedTemplate>
  );
}

export default Calendar;