import Component from 'react-pure-render/component';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { Field, reduxForm } from 'redux-form';
import validator from 'validator';
import { PhoneNumberUtil } from 'google-libphonenumber';


import TextEditor from '../components/TextEditor';
import './SettingsPage.scss';
import { fields } from '../../common/lib/redux-fields/index';
import * as fieldsActions from '../../common/lib/redux-fields/actions';
import * as actions from '../../common/users/actions';
import './EditUser.scss';
import User from '../../common/users/models/User';

const messages = defineMessages({
  firstName: {
    defaultMessage: 'First name',
    id: 'user.edit.firstName',
  },
  lastName: {
    defaultMessage: 'Last name',
    id: 'user.edit.lastName',
  },
  email: {
    defaultMessage: 'Email',
    id: 'user.edit.email',
  },
  phone: {
    defaultMessage: 'Phone',
    id: 'user.edit.phone',
  },
  iban: {
    defaultMessage: 'Iban',
    id: 'user.edit.iban',
  },
  variableSymbol: {
    defaultMessage: 'Variable symbol',
    id: 'user.edit.variableSymbol',
  },
  save: {
    defaultMessage: 'Save',
    id: 'user.edit.save',
  },
  facebookLink: {
    defaultMessage: 'Facebook link',
    id: 'user.edit.facebookLink',
  },
  linkedinLink: {
    defaultMessage: 'LinkedIn link',
    id: 'user.edit.linkedinLink',
  },
  personalDescription: {
    defaultMessage: 'Personal description',
    id: 'user.edit.personalDescription',
  },
  actualJobInfo: {
    defaultMessage: 'Actual job',
    id: 'user.edit.actualJobInfo',
  },
  school: {
    defaultMessage: 'School',
    id: 'user.edit.school',
  },
  faculty: {
    defaultMessage: 'Faculty',
    id: 'user.edit.faculty',
  },
  studyProgram: {
    defaultMessage: 'Study program',
    id: 'user.edit.studyProgram',
  },
  personRoles: {
    defaultMessage: 'Person roles',
    id: 'user.edit.personRoles',
  },
  buddyDescription: {
    defaultMessage: 'Buddy description',
    id: 'user.edit.buddyDescription',
  },
  lectorDescription: {
    defaultMessage: 'Lector description',
    id: 'user.edit.lectorDescription',
  },
  guideDescription: {
    defaultMessage: 'Gide description',
    id: 'user.edit.guideDescription',
  },
  studentLevel: {
    defaultMessage: 'Student level',
    id: 'user.edit.studentLevel',
  },
  nexteriaTeamRole: {
    defaultMessage: 'Nexteria team role',
    id: 'user.edit.nexteriaTeamRole',
  },
  userState: {
    defaultMessage: 'User state',
    id: 'user.edit.userState',
  },
  activeUserState: {
    defaultMessage: 'Active',
    id: 'user.edit.activeUserState',
  },
  inactiveUserState: {
    defaultMessage: 'Inactive',
    id: 'user.edit.inactiveUserState',
  },
  temporarySuspendedUserState: {
    defaultMessage: 'Temporary suspended',
    id: 'user.edit.temporarySuspendedUserState',
  },
  username: {
    defaultMessage: 'Username',
    id: 'user.edit.username',
  },
  chooseStudentLevel: {
    defaultMessage: 'Choose student level',
    id: 'user.edit.chooseStudentLevel',
  },
  expelledUserState: {
    defaultMessage: 'Expelled',
    id: 'user.edit.expelledUserState',
  },
  endedUserState: {
    defaultMessage: 'Ended',
    id: 'user.edit.endedUserState',
  },
  oldPassword: {
    defaultMessage: 'Old password',
    id: 'user.edit.oldPassword',
  },
  newPassword: {
    defaultMessage: 'New password',
    id: 'user.edit.newPassword',
  },
  confirmationPassword: {
    defaultMessage: 'Confirmation password',
    id: 'user.edit.confirmationPassword',
  },
  requiredField: {
    defaultMessage: 'This field is required',
    id: 'user.edit.requiredField',
  },
  validEmailError: {
    defaultMessage: 'Must be valid email address',
    id: 'user.edit.validEmailError',
  },
  validPhoneError: {
    defaultMessage: 'Must be valid phone number (+xxxxxxxxxxxx)',
    id: 'user.edit.validPhoneError',
  },
});

const validate = (values, props) => {
  const { formatMessage } = props.intl;

  const errors = {};
  if (!values.firstName) {
    errors.firstName = formatMessage(messages.requiredField);
  }

  if (!values.nexteriaTeamRole) {
    errors.nexteriaTeamRole = formatMessage(messages.requiredField);
  }

  if (!values.lastName) {
    errors.lastName = formatMessage(messages.requiredField);
  }

  if (!values.studentLevel) {
    errors.studentLevel = formatMessage(messages.requiredField);
  }

  if (!values.username) {
    errors.username = formatMessage(messages.requiredField);
  }

  if (!values.email) {
    errors.email = formatMessage(messages.requiredField);
  } else if (!validator.isEmail(values.email)) {
    errors.email = formatMessage(messages.validEmailError);
  }

  if (!values.phone) {
    errors.phone = formatMessage(messages.requiredField);
  } else {
    try {
      const phoneUtil = PhoneNumberUtil.getInstance();
      const isValid = phoneUtil.isValidNumber(phoneUtil.parse(values.phone));
      if (!isValid) {
        errors.phone = formatMessage(messages.validPhoneError);
      }
    } catch (e) {
      errors.phone = formatMessage(messages.validPhoneError);
    }
  }

  return errors;
};

const asyncValidate = (values, dispatch) => {
  let validation = null;
  let errors = {};
  if (values.username) {
    validation = dispatch(actions.verifyUsernameAvailable(values.username,  values.id)).then(() => {}, () => {
      errors.username = 'That username is taken'
    });
  }

  if (values.email) {
    if (validation) {
      validation = validation.then(() => dispatch(actions.verifyEmailAvailable(values.email, values.id)));
    } else {
      validation = dispatch(actions.verifyEmailAvailable(values.email, values.id));
    }

    validation.then(() => {}, () => errors.email = 'That email is taken');
  }

  return validation.then(() => errors, () => errors);
}

export class EditUser extends Component {

  static propTypes = {
    fields: PropTypes.object.isRequired,
    mode: PropTypes.string,
    title: PropTypes.object,
    user: PropTypes.object,
    saveUser: PropTypes.func.isRequired,
    setField: PropTypes.func,
    rolesList: PropTypes.object,
    updateUserRole: PropTypes.func,
    studentLevels: PropTypes.object,
    intl: PropTypes.object.isRequired,
    loadRolesList: PropTypes.func.isRequired,
    loadStudentLevelsList: PropTypes.func.isRequired,
    params: PropTypes.object,
    users: PropTypes.object.isRequired,
    hasPermission: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    handleSubmit: PropTypes.func.isRequired,
  }

  componentWillMount() {
    const { setField, users, user, params } = this.props;

    const userId = params ? params.userId : null;
    let activeUser = user;

    if (userId) {
      activeUser = users.get(parseInt(userId, 10));
    }

    setField(['editUser'], activeUser ? activeUser : new User());
  }

  parsePhone(value) {
    const phoneUtil = PhoneNumberUtil.getInstance();

    try {
      return phoneUtil.formatInOriginalFormat(phoneUtil.parseAndKeepRawInput(value));
    } catch (e) {
      return value;
    }
  }

  renderInput({ input, label, type, meta: { asyncValidating, touched, error, pristine } }) {

    return (
      <div className={`form-group ${touched && error && (!pristine || !input.value) ? 'has-error' : ''}`}>
        <label className="col-sm-2 control-label">
          {label}
        </label>
        <div className={`col-sm-10 ${asyncValidating ? 'async-validating' : ''}`}>
          <input
            {...input}
            placeholder={label} type={type}
            className="form-control"
          />
          {pristine && input.value ?
            ''
            :
            <div className="has-error">
              {touched && error && <label>{error}</label>}
            </div>
          }
        </div>
      </div>
    );
  }

  renderSelect(data) {
    const { input, label, children, meta: { touched, error } } = data;

    return (
      <div className={`form-group ${touched && error ? 'has-error' : ''}`}>
        <label className="col-sm-2 control-label">
          {label}
        </label>
        <div className="col-sm-10">
          <select
            {...input}
            className="form-control"
          >
          {children}
          </select>
          <div className="has-error">
            {touched && error && <label>{error}</label>}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { fields, mode, pristine, submitting, title, rolesList, studentLevels } = this.props;
    const { saveUser, handleSubmit, updateUserRole, hasPermission } = this.props;
    const { formatMessage } = this.props.intl;

    if (!fields.roles.value || !rolesList) {
      return <div></div>;
    }

    return (
      <div>
        <section className="content-header">
          <h1>{title}</h1>
        </section>

        <section className="content">
          <div className="row">
            <div className="col-md-3">
              <div className="box box-primary">
                <div className="box-body box-profile">
                  {fields.picture ?
                    <img
                      className="profile-user-img img-responsive img-circle"
                      src="{fields.picture}"
                      alt={`${fields.firstName.value} ${fields.lastName.value}`}
                    />
                    : <i className="fa fa-user avatar-icon-profile"></i>
                  }

                  <h3 className="profile-username text-center">
                    {`${fields.firstName.value} ${fields.lastName.value}`}
                  </h3>

                  {mode !== 'profile' ?
                    <div className="form-group text-left">
                      <label><FormattedMessage {...messages.personRoles} /></label>
                        {rolesList.valueSeq().map(role =>
                          <div className="checkbox" key={role.id}>
                            <label>
                              <input
                                type="checkbox"
                                onChange={() => updateUserRole(role.id, !fields.roles.value.includes(role.id))}
                                checked={fields.roles.value.includes(role.id)}
                              />
                              {role.display_name}
                            </label>
                          </div>
                        )}
                    </div>
                    : ''
                  }
                </div>
              </div>
            </div>
            <div className="col-md-9">
              <div className="nav-tabs-custom">
                <div className="tab-content">
                  <div className="tab-pane active" id="settings">
                    <form className="form-horizontal" onSubmit={handleSubmit((data) => saveUser(data))}>
                      <Field
                        name="firstName"
                        type="text"
                        component={this.renderInput}
                        label={`${formatMessage(messages.firstName)}*`}
                      />

                      <Field
                        name="lastName"
                        type="text"
                        component={this.renderInput}
                        label={`${formatMessage(messages.lastName)}*`}
                      />

                      <Field
                        name="username"
                        type="text"
                        component={this.renderInput}
                        label={`${formatMessage(messages.username)}*`}
                      />

                      <Field
                        name="email"
                        type="email"
                        component={this.renderInput}
                        label={`${formatMessage(messages.email)}*`}
                      />

                      <Field
                        name="phone"
                        type="text"
                        parse={this.parsePhone}
                        component={this.renderInput}
                        label={`${formatMessage(messages.phone)}*`}
                      />

                      {fields.roles.value.includes(rolesList.get('STUDENT').id) ?

                        <Field
                          name="studentLevelId"
                          component={this.renderSelect}
                          label={`${formatMessage(messages.studentLevel)}*`}
                        >
                          <option value="" readOnly>{formatMessage(messages.chooseStudentLevel)}</option>
                          {studentLevels.valueSeq().map(level =>
                            <option key={level.id} value={level.id}>{level.name}</option>
                          )}
                        </Field>
                        : ''
                      }

                      <div className="form-group">
                        <label htmlFor="inputName" className="col-sm-2 control-label">
                          <FormattedMessage {...messages.facebookLink} />
                        </label>

                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            {...fields.facebookLink}
                            id="facebookLink"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="inputName" className="col-sm-2 control-label">
                          <FormattedMessage {...messages.linkedinLink} />
                        </label>

                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            {...fields.linkedinLink}
                            id="linkedinLink"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="iban" className="col-sm-2 control-label">
                          <FormattedMessage {...messages.iban} />
                        </label>

                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            {...fields.iban}
                            id="iban"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="iban" className="col-sm-2 control-label">
                          <FormattedMessage {...messages.variableSymbol} />
                        </label>

                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            readOnly
                            value={fields.variableSymbol.value}
                            id="variableSymbol"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="personalDescription" className="col-sm-2 control-label">
                          <FormattedMessage {...messages.personalDescription} />
                        </label>

                        <div className="col-sm-10">
                          <TextEditor
                            value={fields.personalDescription.value}
                            onChange={(value) =>
                              fields.personalDescription.onChange({ target: { value } })
                            }
                            id="personalDescription"
                            placeholder="Personal description ..."
                          />
                        </div>
                      </div>

                      {fields.roles.value.includes(rolesList.get('GUIDE').id) ?
                        <div className="form-group">
                          <label htmlFor="guideDescription" className="col-sm-2 control-label">
                            <FormattedMessage {...messages.guideDescription} />
                          </label>

                          <div className="col-sm-10">
                            <TextEditor
                              value={fields.guideDescription.value}
                              onChange={(value) =>
                                fields.guideDescription.onChange({ target: { value } })
                              }
                              id="guideDescription"
                              placeholder="Gide description ..."
                            />
                          </div>
                        </div>
                        : ''
                      }

                      {fields.roles.value.includes(rolesList.get('LECTOR').id) ?
                        <div className="form-group">
                          <label htmlFor="lectorDescription" className="col-sm-2 control-label">
                            <FormattedMessage {...messages.lectorDescription} />
                          </label>

                          <div className="col-sm-10">
                            <TextEditor
                              value={fields.lectorDescription.value}
                              onChange={(value) =>
                                fields.lectorDescription.onChange({ target: { value } })
                              }
                              id="lectorDescription"
                              placeholder="Lector description ..."
                            />
                          </div>
                        </div>
                        : ''
                      }

                      {fields.roles.value.includes(rolesList.get('BUDDY').id) ?
                        <div className="form-group">
                          <label htmlFor="buddyDescription" className="col-sm-2 control-label">
                            <FormattedMessage {...messages.buddyDescription} />
                          </label>

                          <div className="col-sm-10">
                            <TextEditor
                              value={fields.buddyDescription.value}
                              onChange={(value) =>
                                fields.buddyDescription.onChange({ target: { value } })
                              }
                              id="buddyDescription"
                              placeholder="Buddy description ..."
                            />
                          </div>
                        </div>
                        : ''
                      }

                      <div className="form-group">
                        <label htmlFor="actualJobInfo" className="col-sm-2 control-label">
                          <FormattedMessage {...messages.actualJobInfo} />
                        </label>

                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            {...fields.actualJobInfo}
                            id="actualJobInfo"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="school" className="col-sm-2 control-label">
                          <FormattedMessage {...messages.school} />
                        </label>

                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            {...fields.school}
                            id="school"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="faculty" className="col-sm-2 control-label">
                          <FormattedMessage {...messages.faculty} />
                        </label>

                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            {...fields.faculty}
                            id="faculty"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="studyProgram" className="col-sm-2 control-label">
                          <FormattedMessage {...messages.studyProgram} />
                        </label>

                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            {...fields.studyProgram}
                            id="studyProgram"
                          />
                        </div>
                      </div>

                      {mode !== 'profile' ?
                        <div className="form-group">
                          <label htmlFor="userState" className="col-sm-2 control-label">
                            <FormattedMessage {...messages.userState} />
                          </label>

                          <div className="col-sm-10">
                            <select
                              className="form-control"
                              {...fields.state}
                              id="userState"
                            >
                              <option value={'active'}>
                                {formatMessage(messages.activeUserState)}
                              </option>
                              <option value={'inactive'}>
                                {formatMessage(messages.inactiveUserState)}
                              </option>
                              <option value={'temporarySuspended'}>
                                {formatMessage(messages.temporarySuspendedUserState)}
                              </option>
                              <option value={'temporarySuspended'}>
                                {formatMessage(messages.expelledUserState)}
                              </option>
                              <option value={'temporarySuspended'}>
                                {formatMessage(messages.endedUserState)}
                              </option>
                            </select>
                          </div>
                        </div>
                        : ''
                      }

                      {fields.roles.value.includes(rolesList.get('NEXTERIA_TEAM').id) ?
                        <Field
                          name="nexteriaTeamRole"
                          type="text"
                          component={this.renderInput}
                          label={`${formatMessage(messages.nexteriaTeamRole)}*`}
                        />
                        : ''
                      }

                      {fields.id.value === null ?
                        <div>
                          <div className="form-group">
                            <label htmlFor="newPassword" className="col-sm-2 control-label">
                              <FormattedMessage {...messages.newPassword} />
                            </label>

                            <div className="col-sm-10">
                              <input
                                type="password"
                                className="form-control"
                                {...fields.newPassword}
                                id="newPassword"
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="confirmationPassword" className="col-sm-2 control-label">
                              <FormattedMessage {...messages.confirmationPassword} />
                            </label>

                            <div className="col-sm-10">
                              <input
                                type="password"
                                className="form-control"
                                {...fields.confirmationPassword}
                                id="confirmationPassword"
                              />
                            </div>
                          </div>
                        </div>
                        : ''
                      }

                      {(fields.id.value && hasPermission('update_users')) || (!fields.id.value && hasPermission('create_users')) || mode === 'profile' ?
                        <div className="form-group">
                          <div className="col-sm-offset-2 col-sm-10">
                            <button type="submit" disabled={pristine || submitting} className="btn btn-success">
                              <FormattedMessage {...messages.save} />
                            </button>
                          </div>
                        </div>
                        : ''
                      }
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

EditUser = fields(EditUser, {
  path: 'editUser',
  fields: [
    'id',
    'username',
    'firstName',
    'lastName',
    'facebookLink',
    'linkedinLink',
    'photo',
    'email',
    'phone',
    'actualJobInfo',
    'school',
    'faculty',
    'studyProgram',
    'personalDescription',
    'roles',
    'iban',
    'variableSymbol',
    'lectorDescription',
    'guideDescription',
    'buddyDescription',
    'nexteriaTeamRole',
    'studentLevelId',
    'state',
    'newPassword',
    'oldPassword',
    'confirmationPassword',
  ],
});

EditUser = reduxForm({
  form: 'editUser',
  validate,
  asyncValidate,
  asyncBlurFields: ['username', 'email'],
})(EditUser);

EditUser = injectIntl(EditUser);

export default connect((state) => ({
  rolesList: state.users.rolesList,
  users: state.users.users,
  studentLevels: state.users.studentLevels,
  hasPermission: (permission) => state.users.hasPermission(permission, state),
  initialValues: state.fields.get('editUser') ? state.fields.get('editUser').toObject() : state.fields.get('editUser'),
}), { ...fieldsActions, ...actions })(EditUser);
