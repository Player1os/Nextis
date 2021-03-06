import { Record, Map, List } from 'immutable';
import parse from 'date-fns/parse';

import * as actions from './actions';
import * as userActions from '../users/actions';
import * as guideActions from '../guides/actions';
import Student from './models/Student';

const InitialState = Record({
  admin: new Map({
    students: new Map({}),
    activeStudentComments: new Map({}),
    missingPoints: new List(),
  }),
  choosedGuideId: null,
  guidesOptions: new Map(),
}, 'students');

export default function studentsReducer(state = new InitialState, action) {
  switch (action.type) {

    case actions.END_SCHOOL_YEAR_SUCCESS:
    case actions.UPLOAD_NEW_STUDENTS_EXCEL_SUCCESS:
    case actions.CHANGE_STUDENT_LEVEL_SUCCESS:
    case actions.CHANGE_STUDENTS_ACTIVITY_POINTS_SUCCESS:
    case actions.CHANGE_TUITION_FEE_SUCCESS:
    case guideActions.DELETE_STUDENT_GUIDE_CONNECTION_SUCCESS:
    case actions.CHANGE_STUDENT_STATUS_SUCCESS:
    case actions.ASSIGN_STUDENT_GUIDE_SUCCESS:
    case actions.FETCH_ADMIN_STUDENTS_SUCCESS: {
      return state.setIn(['admin', 'students'], new Map(action.payload.map(student =>
        [student.id, new Map(new Student({
          ...student,
          guidesOptions: student.guidesOptions ? new Map(student.guidesOptions.map(guide => [guide.id, new Map(guide)])) : new Map(),
          activityPoints: new List(student.activityPoints.map(activity => new Map(activity))),
        }))]
      )));
    }

    case actions.UPDATE_ACTIVITY_POINTS_SUCCESS: {
      const { id, studentId } = action.payload;

      return state.updateIn(['admin', 'students', studentId, 'activityPoints'], points => {
        const index = points.findIndex(activity => activity.get('id') === id);

        return points.set(index, new Map(action.payload));
      });
    }

    case actions.ADD_ACTIVITY_POINTS_SUCCESS: {
      const activities = action.payload;
      return state.updateIn(['admin', 'students'], students => {
        let newStudents = students;
        activities.forEach(activity => {
          newStudents = newStudents.updateIn(
            [activity.studentId, 'activityPoints'],
            points => points.push(new Map(activity))
          );
        });

        return newStudents;
      }).updateIn(['admin', 'missingPoints'], points => {
        let newPoints = points;
        activities.forEach(activity => {
          const pointsIndex = points.findIndex(point =>
            point.get('studentId') === activity.studentId &&
            point.get('eventId') === activity.activityModelId &&
            activity.activityType === 'event'
          );

          if (pointsIndex !== -1) {
            newPoints = newPoints.delete(pointsIndex);
          }
        });

        return newPoints;
      });
    }

    case userActions.FETCH_STUDENT_SUCCESS: {
      const { studentId } = action.meta;
      const student = action.payload;

      return state.setIn(['admin', 'students', studentId], new Map(new Student({
        ...student,
        guidesOptions: student.guidesOptions ? new Map(student.guidesOptions.map(guide => [guide.id, new Map(guide)])) : new Map(),
        activityPoints: new List(student.activityPoints.map(activity => new Map(activity))),
      })));
    }

    case actions.DELETE_ACTIVITY_POINTS_SUCCESS: {
      const { studentId, activityPointsId } = action.meta;

      return state.updateIn(['admin', 'students'], students => {
        const activityIndex = students.getIn([studentId, 'activityPoints']).findIndex(activity =>
          activity.get('id') === activityPointsId
        );

        return students.updateIn(
          [studentId, 'activityPoints'],
          points => points.delete(activityIndex));
      });
    }

    case actions.FETCH_EVENT_ACTIVITY_DETAILS_SUCCESS: {
      const { studentId, eventId } = action.meta;

      return state.updateIn(['admin', 'students'], students => {
        const activityIndex = students.getIn([studentId, 'activityPoints']).findIndex(activity =>
          activity.get('activityType') === 'event' && activity.get('activityModelId') === eventId
        );

        return students.setIn(
          [studentId, 'activityPoints', activityIndex, 'details'],
          new Map(action.payload)
        );
      });
    }

    case actions.FETCH_STUDENT_COMMENTS_SUCCESS: {
      let newState = state.setIn(
        ['admin', 'activeStudentComments'],
        new Map(action.payload.map(comment =>
          [comment.id, new Map({
            ...comment,
            createdAt: parse(comment.createdAt),
            updatedAt: parse(comment.updatedAt),
            children: new Map(),
          })]
        )
      ));

      action.payload.forEach(comment => {
        if (comment.parentId) {
          newState = newState.updateIn(
            ['admin', 'activeStudentComments', comment.parentId, 'children'],
            children => children.set(comment.id, comment.id)
          );
        }
      });

      return newState;
    }

    case actions.CREATE_STUDENT_NOTE_COMMENT_SUCCESS:
    case actions.CREATE_STUDENT_COMMENT_SUCCESS: {
      const comment = action.payload;
      let newState = state.setIn(['admin', 'activeStudentComments', comment.id], new Map({
        ...comment,
        createdAt: parse(comment.createdAt),
        updatedAt: parse(comment.updatedAt),
        children: new Map(),
      }));

      if (comment.parentId) {
        newState = newState.updateIn(
          ['admin', 'activeStudentComments', comment.parentId, 'children'],
          children => children.set(comment.id, comment.id)
        );
      }

      return newState;
    }

    case actions.UPDATE_NOTE_COMMENT_SUCCESS: {
      const { id, title, body } = action.payload;

      return state.setIn(['admin', 'activeStudentComments', id, 'title'], title)
                  .setIn(['admin', 'activeStudentComments', id, 'body'], body);
    }

    case actions.DELETE_COMMENT_SUCCESS: {
      const commentId = action.meta.commentId;
      const comment = state.getIn(['admin', 'activeStudentComments', commentId]);

      let newState = state;
      const parentId = comment.get('parentId');
      if (parentId > 0) {
        newState = newState.deleteIn(
          ['admin', 'activeStudentComments', parentId, 'children', commentId]
        );
      }
      return newState.deleteIn(['admin', 'activeStudentComments', commentId]);
    }

    case actions.LOAD_STUDENT_MISSING_POINTS_SUCCESS: {
      const points = action.payload;

      return state.setIn(['admin', 'missingPoints'], new List(points.map(point => new Map(point))));
    }

    case actions.REMOVE_STUDENTS_GUIDE_OPTION_SUCCESS:
    case actions.ADD_STUDENTS_GUIDE_OPTION_SUCCESS: {
      const { studentId } = action.meta;
      const guides = action.payload;

      return state.setIn(['admin', 'students', studentId, 'guidesOptions'],
        new Map(guides.map(guide => [guide.id, new Map(guide)])
      ));
    }

    case actions.FETCH_STUDENTS_GUIDES_SUCCESS: {
      const { choosedGuideId, guidesOptions } = action.payload;

      return state.set('choosedGuideId', choosedGuideId)
        .set('guidesOptions', new Map(guidesOptions.map(option => [option.id, new Map(option)])));
    }

    default: {
      return state;
    }
  }
}
