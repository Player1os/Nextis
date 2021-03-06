import Component from 'react-pure-render/component';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import RichTextEditor from 'react-rte';


import * as actions from '../../../common/students/actions';
import * as usersActions from '../../../common/users/actions';
import TextEditor from '../../components/TextEditor';
import InputComponent from '../../components/Input';

class StudentNotesTab extends Component {

  static propTypes = {
    student: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    hasPermission: PropTypes.func.isRequired,
    createStudentComment: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    initialized: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    const { initialize } = this.props;

    initialize({
      newCommentBody: RichTextEditor.createValueFromString('', 'html'),
      newCommentTitle: '',
    });
  }

  render() {
    const { student, reset, initialized, handleSubmit, createStudentComment } = this.props;

    if (!initialized) {
      return <div></div>;
    }

    return (
      <form
        id="newCommentForm"
        onSubmit={handleSubmit(data =>
          createStudentComment(data, student.get('id')).then(reset)
        )}
      >
        <Field
          name={'newCommentTitle'}
          component={InputComponent}
          label="Predmet poznámky"
          type="text"
        />
        <Field
          name={'newCommentBody'}
          component={TextEditor}
          label="Správa poznámky"
        />
        <button
          className="btn btn-success pull-right"
          type="submit"
          form="newCommentForm"
        >
            Vytvoriť novú poznámku
        </button>
        <div className="clearfix"></div>
      </form>
    );
  }
}

StudentNotesTab = reduxForm({
  form: 'StudentNotesTab',
})(StudentNotesTab);

export default connect(state => ({
  hasPermission: (permission) => state.users.hasPermission(permission, state),
}), { ...actions, ...usersActions })(StudentNotesTab);
