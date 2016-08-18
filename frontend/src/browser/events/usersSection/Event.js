import Component from 'react-pure-render/component';
import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { FormattedMessage, FormattedDate, defineMessages } from 'react-intl';
import './Event.scss';
import moment from 'moment';


const messages = defineMessages({
  title: {
    defaultMessage: 'Events',
    id: 'events.users.title'
  },
  showPastEvents: {
    defaultMessage: 'Show past events',
    id: 'events.users.showPastEvents'
  },
  eventType_dbk: {
    defaultMessage: 'DBK',
    id: 'event.users.eventType_dbk',
  },
  eventType_ik: {
    defaultMessage: 'IK',
    id: 'event.users.eventType_ik',
  },
  eventType_other: {
    defaultMessage: 'Other',
    id: 'event.users.eventType_other',
  },
  signIn: {
    defaultMessage: 'Sign in',
    id: 'event.users.signIn',
  },
  wontGo: {
    defaultMessage: 'Wont go',
    id: 'event.users.wontGo',
  },
  shortDescription: {
    defaultMessage: 'Short description',
    id: 'event.users.shortDescription',
  },
  showMoreInfo: {
    defaultMessage: 'Show more info',
    id: 'event.users.showMoreInfo',
  },
  lectors: {
    defaultMessage: 'Lectors',
    id: 'event.users.lectors',
  },
  noLectors: {
    defaultMessage: 'There are no lectors',
    id: 'event.users.noLectors',
  },
  signInNoteTitle: {
    defaultMessage: 'Sign in deadline:',
    id: 'event.users.signInNoteTitle',
  },
  signOut: {
    defaultMessage: 'Sign out',
    id: 'event.users.signOut',
  },
});

export default class Event extends Component {

  static propTypes = {
    event: PropTypes.object.isRequired,
    viewer: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    toggleEventDetails: PropTypes.func.isRequired,
    openEventDetailsDialog: PropTypes.func.isRequired,
    attendeeWontGo: PropTypes.func.isRequired,
    attendeeSignIn: PropTypes.func.isRequired,
    openSignOutDialog: PropTypes.func.isRequired,
    openLocationDetailsDialog: PropTypes.func.isRequired,
    nxLocation: PropTypes.object.isRequired,
  };

  render() {
    const { event, viewer, nxLocation, users } = this.props;
    const { toggleEventDetails, openLocationDetailsDialog, openEventDetailsDialog, openSignOutDialog, attendeeWontGo, attendeeSignIn } = this.props;

    const oldEvent = event.eventStartDateTime.isBefore(moment.utc());
    const attendees = event.attendeesGroups.reduce((reduction, group) =>
      reduction.merge(group.users)
    , new Map());

    const attending = attendees.filter(user => user.signedIn);

    // TODO what if user will be in multiple groups?
    const group = event.attendeesGroups.filter(group => group.users.has(viewer.id)).first();
    const attendee = group ? group.users.get(viewer.id) : null;

    const undecided = attendee && !attendee.get('signedIn') && !attendee.get('wontGo') && !attendee.get('signedOut');

    return (
      <li className="users-event">
        <div className="fa bg-green event-type">
          <FormattedMessage {...messages[`eventType_${event.eventType}`]} />
        </div>
        <div className="timeline-item col-md-11">
          <div className="timeline-header">
            <div className="col-md-1 event-date">
              <span className="label label-primary">
                <FormattedDate value={event.eventStartDateTime} />
              </span>
            </div>
            <h3 className="col-md-5">{event.name}</h3>
            {attendee ?
              <div className="col-md-5 attendance-container">
                {oldEvent ?
                  <div>
                    <div className="col-md-6"></div>
                    <div className="event-actions col-md-6">
                      {attending.has(viewer.id) ?
                        <i className="fa fa-check was-here"></i>
                        :
                        <i className="fa fa-times wasnt-here"></i>
                      }
                      <i className="fa fa-bars" onClick={() => toggleEventDetails(event)}></i>
                    </div>
                  </div>
                  :
                  <div>
                    <div className="signIn-date-notes col-md-6">
                      <div style={{display: !event.visibleDetails ? '' : 'none' }}>
                        <div><FormattedMessage {...messages.signInNoteTitle} /></div>
                        <div>
                          <FormattedDate value={group.signUpDeadlineDateTime} />
                        </div>
                      </div>
                    </div>
                    {undecided ?
                      <div className="event-actions col-md-6">
                        <button className="btn btn-success btn-xs" onClick={() => attendeeSignIn(event, viewer, group.id)}>
                          <FormattedMessage {...messages.signIn} />
                        </button>
                        <button className="btn btn-danger btn-xs" onClick={() => attendeeWontGo(event, viewer, group.id)}>
                          <FormattedMessage {...messages.wontGo} />
                        </button>
                        <i className="fa fa-bars" onClick={() => toggleEventDetails(event)}></i>
                      </div>
                      :
                      <div className="event-actions col-md-6">
                        {!attendee.get('wontGo') && !attendee.get('signedOut') ?
                          <button className="btn btn-danger btn-xs" onClick={() => openSignOutDialog(event, viewer, group.id)}>
                            <FormattedMessage {...messages.signOut} />
                          </button>
                          :
                          <button className="btn btn-success btn-xs" onClick={() => attendeeSignIn(event, viewer, group.id)}>
                            <FormattedMessage {...messages.signIn} />
                          </button>
                        }
                        <i className="fa fa-bars" onClick={() => toggleEventDetails(event)}></i>
                      </div>
                    }
                  </div>
                }
              </div>
              :
              <div className="col-md-5 attendance-container">
                <div className="event-actions col-md-12">
                  <i className="fa fa-bars" onClick={() => toggleEventDetails(event)}></i>
                </div>
              </div>
            }
          </div>
          <div style={{ display: event.visibleDetails ? '' : 'none' }}>
            <div className="col-md-8">
              <div><strong><FormattedMessage {...messages.shortDescription} />:</strong></div>
              <div dangerouslySetInnerHTML={{ __html: event.shortDescription.toString('html') }}></div>
              <span className="pull-right" onClick={() => openEventDetailsDialog(event.id)}>
                <a><FormattedMessage {...messages.showMoreInfo} /></a>
              </span>
              <div className="lectors-container">
                <div>
                  <strong><FormattedMessage {...messages.lectors} />:</strong>
                </div>
                {event.lectors.size === 0 ?
                  <FormattedMessage {...messages.noLectors} />
                  :
                  event.lectors.map(lector =>
                    <div key={lector}>
                      <div className="col-md-2">
                        <img
                          className="lector-picture"
                          src={users.get(lector).photo ? users.get(lector).photo : '/img/avatar.png'}
                        />
                        {users.get(lector).firstName} {users.get(lector).lastName}
                      </div>
                      <div className="col-md-10" dangerouslySetInnerHTML={{ __html: users.get(lector).lectorDescription.toString('html') }}>
                      </div>
                    </div>
                  )
                }
              </div>
            </div>
            <div className="col-md-4 event-details">
              <div className="col-md-12">
                <strong>Podrobnosti:</strong>
              </div>
              <div className="col-md-12">
                <div className="col-md-2">
                  <i className="fa fa-clock-o"></i>
                </div>
                <div className="col-md-10">
                  {event.eventStartDateTime.format('D.M.YYYY, H:mm')} - {event.eventEndDateTime.format('D.M.YYYY, H:mm')}
                </div>
              </div>
              <div className="col-md-12">
                <div className="col-md-2">
                  <i className="fa fa-usd"></i>
                </div>
                <div className="col-md-10">
                  {event.activityPoints} kreditov
                </div>
              </div>
              <div className="col-md-12">
                <div className="col-md-2">
                  <i className="fa fa-map-marker"></i>
                </div>
                <div className="col-md-10">
                  <a onClick={() => openLocationDetailsDialog(nxLocation.id)}>{nxLocation.name}</a>
                </div>
              </div>
              <div className="col-md-12">
                <div className="col-md-2">
                  <i className="fa fa-group"></i>
                </div>
                <div className="col-md-5">
                  <div>
                    {attending.size} ({event.minCapacity} - {event.maxCapacity})
                  </div>
                  <div>
                    Prihlásených
                  </div>
                </div>
                <div className="col-md-5">
                  <div>
                    {attendees.size}
                  </div>
                  <div>
                    Pozvaných 
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }
}