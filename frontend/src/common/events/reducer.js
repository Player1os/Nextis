import { Record, List, Map } from 'immutable';
import parse from 'date-fns/parse';
import RichTextEditor from 'react-rte';


import EventSettings from './models/EventSettings';
import * as actions from './actions';
import Event from './models/Event';
import AttendeesGroup from '../attendeesGroup/models/AttendeesGroup';


const InitialState = Record({
  eventTypes: new List([
    'dbk',
    'ik',
    'other',
  ]),
  eventsStatuses: new List([
    'draft',
    'published',
  ]),
  visiblePastEvents: false,
  visibleFutureEvents: false,
  events: null,
  eventDetailsId: null,
  locationDetailsId: null,
  signOut: new Record({
    userId: null,
    type: '',
    reason: '',
    eventId: null,
    groupId: null,
  })(),
  attendees: null,
  defaultSettings: null,
  eventSettings: new Map({
    dataLoaded: false,
    data: null,
  }),
  emails: null,
  categories: new Map(),
  actualEvent: new Map(),
}, 'events');

export default function eventsReducer(state = new InitialState, action) {
  switch (action.type) {
    case actions.TOGGLE_PAST_EVENTS: {
      return state.update('visiblePastEvents', visiblePastEvents => !visiblePastEvents);
    }

    case actions.TOGGLE_FUTURE_EVENTS: {
      return state.update('visibleFutureEvents', visibleFutureEvents => !visibleFutureEvents);
    }

    case actions.LOAD_QUESTIONNAIRE_SUCCESS: {
      let questionForm = action.payload.questionForm;
      if (questionForm) {
        let choicesList = new Map();
        questionForm.questions.forEach(question => {
          choicesList = choicesList.set(question.id, new Map());
          question.choices.forEach(choice => {
            choicesList = choicesList.setIn([question.id, choice.id], new Map());
          });
        });

        questionForm = new Map({
          formData: new Map({
            ...questionForm,
            questions: new Map(questionForm.questions.map(question =>
              [question.id, new Map({
                ...question,
                dependentOn: new Map(Object.keys(question.dependentOn).map(qId =>
                  [qId, new Map(question.dependentOn[qId].map(choiceId => {
                    choicesList = choicesList.setIn([qId, choiceId, question.id], true);
                    return [choiceId, true];
                  }))]
                )),
                groupSelection: new Map(question.groupSelection.map(group => [group, true])),
                choices: new Map(question.choices.map(choice =>
                  [choice.id, new Map({
                    ...choice,
                  })]
                )),
              })]
            )),
          }),
          choicesList,
          isOpen: false,
          isNewQuestionMenuOpen: false,
        });
      }

      return state.setIn(['actualEvent', 'id'], action.payload.id)
                  .setIn(['actualEvent', 'questionForm'], questionForm);
    }

    case actions.FETCH_QUESTIONNAIRE_RESULTS_SUCCESS: {
      const event = state.get('events').filter(event =>
        event.hasIn(['questionForm', 'formData', 'id']) && event.getIn(['questionForm', 'formData', 'id']) === action.meta.formId
      ).first();

      return state.setIn(['actualEvent', 'id'], event.get('id'))
                  .setIn(['actualEvent', 'formResults'], new Map(Object.keys(action.payload).map(qId =>
                    [qId, new Map(Object.keys(action.payload[qId]).map(choiceKey =>
                      [choiceKey, new Map(action.payload[qId][choiceKey].map((answer, index) => [index, new Map(answer)]))]
                    ))]
                  )));
    }

    case actions.SAVE_EVENT_SUCCESS: {
      let questionForm = action.payload.questionForm;
      if (questionForm) {
        let choicesList = new Map();
        questionForm.questions.forEach(question => {
          choicesList = choicesList.set(question.id, new Map());
          if (question.type !== 'shortText' && question.type !== 'longText') {
            question.choices.forEach(choice => {
              choicesList = choicesList.setIn([question.id, choice.id], new Map());
            });
          }
        });

        questionForm = new Map({
          formData: new Map({
            ...questionForm,
            questions: new Map(questionForm.questions.map(question =>
              [question.id, new Map({
                ...question,
                dependentOn: new Map(Object.keys(question.dependentOn).map(qId =>
                  [qId, new Map(question.dependentOn[qId].map(choiceId => {
                    choicesList = choicesList.setIn([qId, choiceId, question.id], true);
                    return [choiceId, true];
                  }))]
                )),
                groupSelection: new Map(question.groupSelection.map(group => [group, true])),
                choices: new Map(question.choices.map(choice =>
                  [choice.id, new Map({
                    ...choice,
                  })]
                )),
              })]
            )),
          }),
          choicesList,
          isOpen: false,
          isNewQuestionMenuOpen: false,
        });
      }

      const event = new Event({
        ...action.payload,
        lectors: new List(action.payload.lectors),
        groupedEvents: new List(action.payload.groupedEvents),
        exclusionaryEvents: new List(action.payload.exclusionaryEvents),
        eventStartDateTime: parse(action.payload.eventStartDateTime),
        eventEndDateTime: parse(action.payload.eventEndDateTime),
        description: RichTextEditor.createValueFromString(action.payload.description, 'html'),
        shortDescription: RichTextEditor.createValueFromString(action.payload.shortDescription, 'html'),
        attendeesGroups: new List(action.payload.attendeesGroups.map(group => new AttendeesGroup({
          ...group,
          signUpDeadlineDateTime: parse(group.signUpDeadlineDateTime),
          signUpOpenDateTime: parse(group.signUpOpenDateTime),
          users: new Map(group.users.map(user => [user.id, new Map({
            ...user,
            id: user.id,
            signedIn: user.signedIn ? parse(user.signedIn) : null,
            signedOut: user.signedOut ? parse(user.signedOut) : null,
            wontGo: user.wontGo ? parse(user.wontGo) : null,
            signedOutReason: user.signedOutReason,
          })])),
        }))),
        questionForm,
      });

      return state.update('events', events => events.set(event.id, event));
    }

    case actions.LOAD_EVENTS_LIST_SUCCESS: {
      return state.set('events', new Map(action.payload.map(event => {
        let questionForm = event.questionForm;
        if (questionForm) {
          let choicesList = new Map();
          questionForm.questions.forEach(question => {
            choicesList = choicesList.set(question.id, new Map());
            if (question.type !== 'shortText' && question.type !== 'longText') {
              question.choices.forEach(choice => {
                choicesList = choicesList.setIn([question.id, choice.id], new Map());
              });
            }
          });

          questionForm = new Map({
            formData: new Map({
              ...event.questionForm,
              groupDescriptions: new Map(Object.keys(event.questionForm.groupDescriptions).map(groupId => [groupId, event.questionForm.groupDescriptions[groupId]])),
              questions: new Map(event.questionForm.questions.map(question =>
                [question.id, new Map({
                  ...question,
                  dependentOn: new Map(Object.keys(question.dependentOn).map(qId =>
                    [qId, new Map(question.dependentOn[qId].map(choiceId => {
                      choicesList = choicesList.setIn([qId, choiceId, question.id], true);
                      return [choiceId, true];
                    }))]
                  )),
                  groupSelection: new Map(question.groupSelection.map(group => [group, true])),
                  choices: new Map(question.choices.map(choice =>
                    [choice.id, new Map({
                      ...choice,
                    })]
                  )),
                })]
              )),
            }),
            choicesList,
            isOpen: false,
            isNewQuestionMenuOpen: false,
          });
        }

        return [event.id, new Event({
          ...event,
          lectors: new List(event.lectors),
          groupedEvents: new List(event.groupedEvents),
          exclusionaryEvents: new List(event.exclusionaryEvents),
          eventStartDateTime: parse(event.eventStartDateTime),
          eventEndDateTime: parse(event.eventEndDateTime),
          description: RichTextEditor.createValueFromString(event.description, 'html'),
          shortDescription: RichTextEditor.createValueFromString(event.shortDescription, 'html'),
          attendeesGroups: new List(event.attendeesGroups.map(group => new AttendeesGroup({
            ...group,
            signUpDeadlineDateTime: parse(group.signUpDeadlineDateTime),
            signUpOpenDateTime: parse(group.signUpOpenDateTime),
            users: new Map(group.users.map(user => [user.id, new Map({
              ...user,
              id: user.id,
              signedIn: user.signedIn ? parse(user.signedIn) : null,
              signedOut: user.signedOut ? parse(user.signedOut) : null,
              wontGo: user.wontGo ? parse(user.wontGo) : null,
              signedOutReason: user.signedOutReason,
            })])),
          }))),
          questionForm,
        })];
      })));
    }

    case actions.REMOVE_EVENT_SUCCESS: {
      return state.update('events', events => events.delete(action.payload));
    }

    case actions.TOGGLE_EVENT_ACTIONS: {
      const eventId = action.payload.eventId;
      const visible = action.payload.visible;
      return state.setIn(['events', eventId, 'visibleDetails'], visible);
    }

    case actions.CLOSE_EVENT_DETAILS_DIALOG: {
      return state.set('eventDetailsId', null);
    }

    case actions.OPEN_EVENT_DETAILS_DIALOG: {
      return state.set('eventDetailsId', action.payload);
    }

    case actions.ATTENDEE_WONT_GO_SUCCESS: {
      const response = action.payload;
      const groupIndex = state.events.get(response.eventId).attendeesGroups
        .findIndex(group => group.id === response.groupId);

      return state.updateIn([
        'events',
        response.eventId,
        'attendeesGroups',
        groupIndex,
        'users',
        response.id,
      ], user => user.set('wontGo', parse(response.wontGo))
        .set('signedIn', null)
        .set('signedOut', null))
        .setIn(['signOut', 'userId'], null)
        .setIn(['signOut', 'eventId'], null)
        .setIn(['signOut', 'reason'], '')
        .setIn(['signOut', 'type'], '')
        .setIn(['signOut', 'groupId'], null);
    }

    case actions.ATTENDEE_SIGN_IN_SUCCESS: {
      const response = action.payload;
      const groupIndex = state.events.get(response.eventId).attendeesGroups
        .findIndex(group => group.id === response.groupId);

      return state.updateIn([
        'events',
        response.eventId,
        'attendeesGroups',
        groupIndex,
        'users',
        response.id,
      ], user => user.set('signedIn', parse(response.signedIn))
        .set('signedOut', null)
        .set('wontGo', null));
    }

    case actions.ATTENDEE_SIGN_OUT_AS_STANDIN_SUCCESS: {
      const response = action.payload;
      const groupIndex = state.events.get(response.eventId).attendeesGroups
        .findIndex(group => group.id === response.groupId);

      return state.updateIn([
        'events',
        response.eventId,
        'attendeesGroups',
        groupIndex,
        'users',
        response.id,
      ], user => user.set('standIn', null));
    }

    case actions.ATTENDEE_SIGN_IN_AS_STANDIN_SUCCESS: {
      const response = action.payload;
      const groupIndex = state.events.get(response.eventId).attendeesGroups
        .findIndex(group => group.id === response.groupId);

      return state.updateIn([
        'events',
        response.eventId,
        'attendeesGroups',
        groupIndex,
        'users',
        response.id,
      ], user => user.set('standIn', parse(response.standIn)));
    }

    case actions.ATTENDEE_SIGN_OUT_SUCCESS: {
      const response = action.payload;
      const groupIndex = state.events.get(response.eventId).attendeesGroups
        .findIndex(group => group.id === response.groupId);

      return state.updateIn([
        'events',
        response.eventId,
        'attendeesGroups',
        groupIndex,
        'users',
        response.id,
      ], user => user.set('signedOut', parse(response.signedOut))
        .set('signedOutReason', response.signedOutReason)
        .set('signedIn', null)
        .set('wontGo', null))
        .setIn(['signOut', 'userId'], null)
        .setIn(['signOut', 'eventId'], null)
        .setIn(['signOut', 'reason'], '')
        .setIn(['signOut', 'type'], '')
        .setIn(['signOut', 'groupId'], null);
    }

    case actions.CHANGE_ATTENDEE_FEEDBACK_STATUS_SUCCESS: {
      const response = action.payload;
      const groupIndex = state.events.get(response.eventId).attendeesGroups
        .findIndex(group => group.id === response.groupId);

      return state.updateIn([
        'events',
        response.eventId,
        'attendeesGroups',
        groupIndex,
        'users',
        response.id,
      ], user => user.set('filledFeedback', response.filledFeedback));
    }

    case actions.CHANGE_ATTENDEE_PRESENCE_STATUS_SUCCESS: {
      const response = action.payload;
      const groupIndex = state.events.get(response.eventId).attendeesGroups
        .findIndex(group => group.id === response.groupId);

      return state.updateIn([
        'events',
        response.eventId,
        'attendeesGroups',
        groupIndex,
        'users',
        response.id,
      ], user => user.set('wasPresent', response.wasPresent));
    }

    case actions.OPEN_SIGN_OUT_DIALOG: {
      const { userId, eventId, groupId, type } = action.payload;
      return state.setIn(['signOut', 'userId'], userId)
                  .setIn(['signOut', 'eventId'], eventId)
                  .setIn(['signOut', 'type'], type)
                  .setIn(['signOut', 'groupId'], groupId);
    }

    case actions.CHANGE_SIGNOUT_REASON: {
      return state.setIn(['signOut', 'reason'], action.payload);
    }

    case actions.CANCEL_SIGN_OUT: {
      return state.setIn(['signOut', 'userId'], null)
                  .setIn(['signOut', 'eventId'], null)
                  .setIn(['signOut', 'reason'], '')
                  .setIn(['signOut', 'type'], '')
                  .setIn(['signOut', 'groupId'], null);
    }

    case actions.OPEN_LOCATION_DETAILS_DIALOG: {
      return state.set('locationDetailsId', action.payload);
    }

    case actions.CLOSE_LOCATION_DETAILS_DIALOG: {
      return state.set('locationDetailsId', null);
    }

    case actions.GET_EVENTS_ATTENDEES_FOR_USER_SUCCESS: {
      const attendees = action.payload;
      return state.set('attendees', new Map(attendees));
    }

    case actions.UPDATE_DEFAULT_EVENTS_SETTINGS_SUCCESS:
    case actions.FETCH_DEFAULT_EVENT_SETTINGS_SUCCESS: {
      return state.set('defaultSettings', new Map(action.payload));
    }

    case actions.CREATE_EVENT_CUSTOM_SETTINGS: {
      return state.setIn(['eventSettings', 'data'], new EventSettings());
    }

    case actions.LOAD_EVENT_CUSTOM_SETTINGS_SUCCESS: {
      const data = action.payload;

      if ('error' in data && data.code === 404) {
        return state.setIn(['eventSettings', 'dataLoaded'], true)
                    .setIn(['eventSettings', 'data'], null);
      }

      return state.setIn(['eventSettings', 'dataLoaded'], true)
                  .setIn(['eventSettings', 'data'], new EventSettings(action.payload));
    }

    case actions.CLEAR_EVENT_CUSTOM_SETTINGS_SUCCESS: {
      return state.setIn(['eventSettings', 'dataLoaded'], false)
                  .setIn(['eventSettings', 'data'], null);
    }

    case actions.UPDATE_EVENT_CUSTOM_SETTINGS_SUCCESS: {
      return state.setIn(['eventSettings', 'dataLoaded'], true)
                  .setIn(['eventSettings', 'data'], new EventSettings(action.payload));
    }

    case actions.RESET_EVENT_EMAILS_STATUS: {
      return state.set('emails', null);
    }

    case actions.LOAD_EVENT_CATEGORIES_LIST_SUCCESS: {
      return state.set('categories', new Map(action.payload.map(category =>
        [category.codename, new Map(category)]
      )));
    }

    case actions.CHANGE_ACTIVE_EVENT_CATEGORY_SUCCESS: {
      return state.set('events', new Map(action.payload.map(event => {
        let questionForm = event.questionForm;
        if (questionForm) {
          let choicesList = new Map();
          questionForm.questions.forEach(question => {
            choicesList = choicesList.set(question.id, new Map());
            if (question.type !== 'shortText' && question.type !== 'longText') {
              question.choices.forEach(choice => {
                choicesList = choicesList.setIn([question.id, choice.id], new Map());
              });
            }
          });

          questionForm = new Map({
            formData: new Map({
              ...event.questionForm,
              groupDescriptions: new Map(Object.keys(event.questionForm.groupDescriptions).map(groupId => [groupId, event.questionForm.groupDescriptions[groupId]])),
              questions: new Map(event.questionForm.questions.map(question =>
                [question.id, new Map({
                  ...question,
                  dependentOn: new Map(Object.keys(question.dependentOn).map(qId =>
                    [qId, new Map(question.dependentOn[qId].map(choiceId => {
                      choicesList = choicesList.setIn([qId, choiceId, question.id], true);
                      return [choiceId, true];
                    }))]
                  )),
                  groupSelection: new Map(question.groupSelection.map(group => [group, true])),
                  choices: new Map(question.choices.map(choice =>
                    [choice.id, new Map({
                      ...choice,
                    })]
                  )),
                })]
              )),
            }),
            choicesList,
            isOpen: false,
            isNewQuestionMenuOpen: false,
          });
        }

        return [event.id, new Event({
          ...event,
          lectors: new List(event.lectors),
          groupedEvents: new List(event.groupedEvents),
          exclusionaryEvents: new List(event.exclusionaryEvents),
          eventStartDateTime: parse(event.eventStartDateTime),
          eventEndDateTime: parse(event.eventEndDateTime),
          description: RichTextEditor.createValueFromString(event.description, 'html'),
          shortDescription: RichTextEditor.createValueFromString(event.shortDescription, 'html'),
          attendeesGroups: new List(event.attendeesGroups.map(group => new AttendeesGroup({
            ...group,
            signUpDeadlineDateTime: parse(group.signUpDeadlineDateTime),
            signUpOpenDateTime: parse(group.signUpOpenDateTime),
            users: new Map(group.users.map(user => [user.id, new Map({
              ...user,
              id: user.id,
              signedIn: user.signedIn ? parse(user.signedIn) : null,
              signedOut: user.signedOut ? parse(user.signedOut) : null,
              wontGo: user.wontGo ? parse(user.wontGo) : null,
              signedOutReason: user.signedOutReason,
            })])),
          }))),
          questionForm,
        })];
      })));
    }

    case actions.FETCH_EVENT_EMAILS_STATUS_SUCCESS: {
      return state.set('emails', new Map(action.payload.map(email =>
        [email.codename, new Map(email)]
      )));
    }

  }

  return state;
}
