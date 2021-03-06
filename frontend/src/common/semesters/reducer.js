import { Record, Map } from 'immutable';

import * as actions from './actions';

const InitialState = Record({
  semesters: null,
  activeSemesterId: null,
  levels: null,
  admin: new Map({
    semesters: new Map({}),
  })
}, 'semesters');

export default function semestersReducer(state = new InitialState, action) {
  switch (action.type) {

    case actions.FETCH_SEMESTERS_SUCCESS: {
      return state.set('semesters', new Map(action.payload.semesters.map(semester =>
        [semester.id, new Map(semester)]
      ))).set('activeSemesterId', action.payload.activeSemesterId);
    }

    case actions.FETCH_ADMIN_SEMESTERS_SUCCESS: {
      return state.setIn(['admin', 'semesters'], new Map(action.payload.map(semester =>
        [semester.id, new Map(semester)]
      )));
    }

    case actions.SAVE_SEMESTER_SUCCESS: {
      return state.updateIn(['admin', 'semesters'], semesters =>
        semesters.set(action.payload[0].id, new Map(action.payload[0]))
      );
    }

    default: {
      return state;
    }
  }
}
