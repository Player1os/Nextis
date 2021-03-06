import Component from 'react-pure-render/component';
import React, { PropTypes } from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';

import * as actions from '../../common/events/actions';
import EventsDefaultSettings from './EventsDefaultSettings';


const messages = defineMessages({
  title: {
    defaultMessage: 'Events',
    id: 'events.manage.title'
  },
  eventsDefaultSettingsTabTitle: {
    defaultMessage: 'Settings',
    id: 'events.manage.eventsDefaultSettingsTabTitle'
  },
  eventsTabTitle: {
    defaultMessage: 'Events',
    id: 'events.manage.eventsTabTitle'
  },
  archived: {
    defaultMessage: 'Archived',
    id: 'events.manage.archived',
  },
  drafts: {
    defaultMessage: 'Drafts',
    id: 'events.manage.drafts',
  },
  published: {
    defaultMessage: 'Published',
    id: 'events.manage.published',
  },
  beforeSignInOpening: {
    defaultMessage: 'Before Sign In Opening',
    id: 'events.manage.beforeSignInOpening',
  },
  afterSignInOpening: {
    defaultMessage: 'After Sign In Opening',
    id: 'events.manage.afterSignInOpening',
  },
  signInClosed: {
    defaultMessage: 'Sign In Closed',
    id: 'events.manage.signInClosed',
  },
  waitingForFeedback: {
    defaultMessage: 'Waiting for Feedback',
    id: 'events.manage.waitingForFeedback',
  },
  watingForEvaluation: {
    defaultMessage: 'Wating for evaluation',
    id: 'events.manage.watingForEvaluation',
  },
});

class EventsPage extends Component {

  static propTypes = {
    defaultSettings: PropTypes.object,
    fetchDefaultEventsSettings: PropTypes.func.isRequired,
    loadEventCategories: PropTypes.func.isRequired,
    changeActiveEventCategory: PropTypes.func.isRequired,
    eventCategories: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { fetchDefaultEventsSettings, loadEventCategories, changeActiveEventCategory } = this.props;
    fetchDefaultEventsSettings();
    loadEventCategories(true);

    if (this.props.params.category) {
      changeActiveEventCategory(this.props.params.category);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { changeActiveEventCategory, eventCategories } = this.props;
    const category = this.props.params.category;

    if (eventCategories && eventCategories.has(nextProps.params.category) && category !== nextProps.params.category) {
      changeActiveEventCategory(nextProps.params.category);
    }
  }

  render() {
    const {
      eventCategories,
      changeActiveEventCategory,
      children,
    } = this.props;

    if (!eventCategories) {
      return <div></div>;
    }

    const activeCategoryCodename = this.props.params.category;

    let totalEventsCount = 0;
    if (eventCategories.has('drafts') && eventCategories.has('published') &&
      eventCategories.has('archived')) {
      totalEventsCount = eventCategories.getIn(['drafts', 'events']).size +
      eventCategories.getIn(['published', 'events']).size +
      eventCategories.getIn(['archived', 'events']).size;
    }

    return (
      <div className="content">
        <div className="row">
          <div className="col-md-4">
            <div className="box box-widget widget-user-2">
              <div className="info-box bg-yellow">
                <span className="info-box-icon"><i className="fa fa-calendar"></i></span>
                <div className="info-box-content">
                  <h2>
                    <span>Eventy - {totalEventsCount}</span>
                    <i
                      className="fa fa-cogs"
                      style={{ marginLeft: '1em', fontSize: '0.8em', cursor: 'pointer' }}
                      onClick={() => browserHistory.push('/admin/events/settings')}
                    ></i>
                  </h2>
                </div>
              </div>
              <div className="box-footer no-padding">
                <ul className="nav nav-stacked">
                  {eventCategories.map(category => {
                    const isCategoryActive = category.get('codename') === activeCategoryCodename;

                    return (
                      <li
                        key={category.get('codename')}
                        className={isCategoryActive ? 'active' : null}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: isCategoryActive ? 'rgba(245, 177, 24, 0.75)' : null,
                        }}
                        onClick={() => changeActiveEventCategory(category.get('codename'))}
                      >
                        <Link to={`/admin/events/category/${category.get('codename')}`}>
                          <FormattedMessage {...messages[category.get('codename')]} />
                          <span className="pull-right badge bg-blue">
                            {category.get('events').size}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            {children}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  defaultSettings: state.events.defaultSettings,
  events: state.events.events,
  eventCategories: state.events.categories,
}), actions)(EventsPage);
