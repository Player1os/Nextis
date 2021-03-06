import Component from 'react-pure-render/component';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import validator from 'validator';
import { PhoneNumberUtil } from 'google-libphonenumber';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';


import TextEditor from '../components/TextEditor';
import './SettingsPage.scss';
import { fields } from '../../common/lib/redux-fields/index';
import * as fieldsActions from '../../common/lib/redux-fields/actions';
import * as actions from '../../common/users/actions';
import './EditUser.scss';
import User from '../../common/users/models/User';
import PasswordChange from './PasswordChange';
import DatePickerComponent from '../components/DatePicker';

const messages = defineMessages({
  firstName: {
    defaultMessage: 'First name',
    id: 'user.edit.firstName',
  },
  info: {
    defaultMessage: 'Info',
    id: 'user.edit.info',
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
  tuitionFeeVariableSymbol: {
    defaultMessage: 'Tuition fee variable symbol',
    id: 'user.edit.tuitionFeeVariableSymbol',
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
    defaultMessage: 'Guide description',
    id: 'user.edit.guideDescription',
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
  requiredLengthField: {
    defaultMessage: 'This field is required, please type {characters} more.',
    id: 'user.edit.requiredLengthField',
  },
  validEmailError: {
    defaultMessage: 'Must be valid email address',
    id: 'user.edit.validEmailError',
  },
  validPhoneError: {
    defaultMessage: 'Must be valid phone number (+xxxxxxxxxxxx)',
    id: 'user.edit.validPhoneError',
  },
  requiredNumber: {
    defaultMessage: 'Must be positive number',
    id: 'user.edit.requiredNumber',
  },
  usernameIsTaken: {
    defaultMessage: 'That username is taken',
    id: 'user.edit.usernameIsTaken',
  },
  emailIsTaken: {
    defaultMessage: 'That email is taken',
    id: 'user.edit.emailIsTaken',
  },
  password: {
    defaultMessage: 'Password',
    id: 'user.edit.password',
  },
  studyYear: {
    defaultMessage: 'Study year',
    id: 'user.edit.studyYear',
  },
});

const validate = (values, props) => {
  const { formatMessage } = props.intl;

  const errors = {};
  const isLector = props.roles && props.rolesList && props.roles.includes(
    props.rolesList.get('LECTOR').id);
  if (!values.firstName) {
    errors.firstName = formatMessage(messages.requiredField);
  }

  if (!values.nexteriaTeamRole) {
    errors.nexteriaTeamRole = formatMessage(messages.requiredField);
  }

  if (!values.lastName) {
    errors.lastName = formatMessage(messages.requiredField);
  }

  if (!values.username) {
    errors.username = formatMessage(messages.requiredField);
  }

  if (!values.email) {
    if (!isLector) {
      errors.email = formatMessage(messages.requiredField);
    }
  } else if (!validator.isEmail(values.email)) {
    errors.email = formatMessage(messages.validEmailError);
  }

  if (!values.phone) {
    if (!isLector) {
      errors.phone = formatMessage(messages.requiredField);
    }
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

  if (props.mode === 'profile') {
    if (!values.iban) {
      errors.iban = formatMessage(messages.requiredField);
    }

    if (!values.school) {
      errors.school = formatMessage(messages.requiredField);
    }

    if (!values.faculty) {
      errors.faculty = formatMessage(messages.requiredField);
    }

    if (!values.studyProgram) {
      errors.studyProgram = formatMessage(messages.requiredField);
    }

    if (!values.studyYear) {
      errors.studyYear = formatMessage(messages.requiredField);
    }

    if (!values.actualJobInfo) {
      errors.actualJobInfo = formatMessage(messages.requiredField);
    }

    const descriptionLength = values.personalDescription ?
      values.personalDescription.getEditorState().getCurrentContent().getPlainText().length
      : 0;
    if (descriptionLength < 100) {
      errors.personalDescription =
        formatMessage(messages.requiredLengthField, { characters: 100 - descriptionLength });
    }
  }

  return errors;
};

const asyncValidate = (values, dispatch, props) => {
  const { formatMessage } = props.intl;

  let validation = null;
  const errors = {};
  if (values.username) {
    validation = dispatch(actions.verifyUsernameAvailable(values.username, values.id))
    .then(() => {}, () => {
      errors.username = formatMessage(messages.usernameIsTaken);
    });
  }

  if (values.email) {
    if (validation) {
      validation = validation.then(() =>
        dispatch(actions.verifyEmailAvailable(values.email, values.id))
      );
    } else {
      validation = dispatch(actions.verifyEmailAvailable(values.email, values.id));
    }

    validation.then(() => {}, () => {
      errors.email = formatMessage(messages.emailIsTaken);
    });
  }

  return validation.then(() => errors, () => errors);
};

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
    intl: PropTypes.object.isRequired,
    loadRolesList: PropTypes.func.isRequired,
    params: PropTypes.object,
    users: PropTypes.object.isRequired,
    hasPermission: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    roles: PropTypes.object,
    userStates: PropTypes.object.isRequired,
    locale: PropTypes.string.isRequired,
    loadUser: PropTypes.func.isRequired,
  }

  async componentWillMount() {
    const { setField, initialize, user, params, loadUser } = this.props;

    const userId = params ? params.userId : null;
    let activeUser = user;

    if (userId) {
      await loadUser(parseInt(userId, 10));
      activeUser = this.props.users.get(parseInt(userId, 10));
    }

    setField(['editUser'], activeUser || new User());
    initialize(activeUser ? activeUser.toObject() : new User().toObject());
  }

  parsePhone(value) {
    const phoneUtil = PhoneNumberUtil.getInstance();

    try {
      return phoneUtil.formatInOriginalFormat(phoneUtil.parseAndKeepRawInput(value));
    } catch (e) {
      return value;
    }
  }

  renderInput(data) {
    const { input, label, type, meta: { asyncValidating, touched, error, pristine } } = data;

    const errorClass = touched && error && (!pristine || !input.value) ? 'has-error' : '';

    return (
      <div className={`form-group ${errorClass}`}>
        <label className="col-sm-2 control-label">
          {label}
        </label>
        <div className={`col-sm-10 ${asyncValidating ? 'async-validating' : ''}`}>
          <input
            {...input}
            readOnly={data.readOnly}
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

  renderRoles(data, rolesList) {
    const { input, label } = data;

    return (
      <div className="form-group text-left">
        <label>{label}</label>
          {rolesList.valueSeq().map(role =>
            <div className="checkbox" key={role.id}>
              <label>
                <input
                  type="checkbox"
                  onChange={() => input.onChange(input.value.includes(role.id) ?
                    input.value.delete(input.value.findIndex((value) => value === role.id))
                    :
                    input.value.push(role.id))
                  }
                  checked={input.value.includes(role.id)}
                />
                {role.display_name}
              </label>
            </div>
          )}
      </div>
    );
  }

  render() {
    const {
      fields,
      mode,
      roles,
      pristine,
      submitting,
      title,
      rolesList,
      userStates,
      locale,
    } = this.props;

    const { saveUser, handleSubmit, hasPermission } = this.props;
    const { formatMessage } = this.props.intl;

    if (!roles || !rolesList) {
      return <div></div>;
    }

    const isLector = roles.includes(rolesList.get('LECTOR').id);

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
                    <Field
                      name="roles"
                      component={(data) => this.renderRoles(data, rolesList)}
                      label={`${formatMessage(messages.personRoles)}`}
                    />
                    : ''
                  }
                </div>
              </div>
            </div>
            <div className="col-md-9">
              <Tabs defaultActiveKey={1} id="users-info-tabs" className="nav-tabs-custom">
                <Tab eventKey={1} title={formatMessage(messages.info)}>
                  <form
                    className="form-horizontal"
                    onSubmit={handleSubmit((data) => saveUser(data))}
                  >
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
                      name="dateOfBirth"
                      labelCol={2}
                      contentCol={10}
                      component={DatePickerComponent}
                      label={'Dátum narodenia'}
                      onlyDate
                      locale={locale}
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
                      label={`${formatMessage(messages.email)}${isLector ? '' : '*'}`}
                    />

                    <Field
                      name="phone"
                      type="text"
                      parse={this.parsePhone}
                      component={this.renderInput}
                      label={`${formatMessage(messages.phone)}${isLector ? '' : '*'}`}
                    />

                    <Field
                      name="facebookLink"
                      type="text"
                      component={this.renderInput}
                      label={`${formatMessage(messages.facebookLink)}`}
                    />

                    <Field
                      name="linkedinLink"
                      type="text"
                      component={this.renderInput}
                      label={`${formatMessage(messages.linkedinLink)}`}
                    />

                    <Field
                      name="iban"
                      type="text"
                      component={this.renderInput}
                      label={`${formatMessage(messages.iban)}${mode === 'profile' ? '*' : ''}`}
                    />

                    <Field
                      name="tuitionFeeVariableSymbol"
                      type="text"
                      readOnly
                      component={this.renderInput}
                      label={`${formatMessage(messages.tuitionFeeVariableSymbol)}`}
                    />

                    <Field
                      name="personalDescription"
                      component={TextEditor}
                      contentCol={10}
                      labelCol={2}
                      label={
                        `${formatMessage(messages.personalDescription)}
                        ${mode === 'profile' ? '*' : ''}`
                      }
                    />

                    <Field
                      name="hobby"
                      component={TextEditor}
                      contentCol={10}
                      labelCol={2}
                      label="Hobby"
                    />

                    <Field
                      name="otherActivities"
                      component={TextEditor}
                      contentCol={10}
                      labelCol={2}
                      label="Ďalšie moje projekty a dobrovoľníctvo"
                    />

                    {roles.includes(rolesList.get('GUIDE').id) ?
                      <Field
                        name="guideDescription"
                        component={TextEditor}
                        contentCol={10}
                        labelCol={2}
                        label={`${formatMessage(messages.guideDescription)}`}
                      />
                      : ''
                    }

                    {roles.includes(rolesList.get('LECTOR').id) ?
                      <Field
                        name="lectorDescription"
                        contentCol={10}
                        labelCol={2}
                        component={TextEditor}
                        label={`${formatMessage(messages.lectorDescription)}`}
                      />
                      : ''
                    }

                    {roles.includes(rolesList.get('BUDDY').id) ?
                      <Field
                        name="buddyDescription"
                        type="text"
                        readOnly
                        contentCol={10}
                        labelCol={2}
                        component={TextEditor}
                        label={`${formatMessage(messages.buddyDescription)}`}
                      />
                      : ''
                    }

                    <Field
                      name="actualJobInfo"
                      type="text"
                      component={this.renderInput}
                      label={
                        `${formatMessage(messages.actualJobInfo)}${mode === 'profile' ? '*' : ''}`
                      }
                    />

                    <Field
                      name="school"
                      type="text"
                      component={this.renderInput}
                      label={`${formatMessage(messages.school)}${mode === 'profile' ? '*' : ''}`}
                    />

                    <Field
                      name="faculty"
                      type="text"
                      component={this.renderInput}
                      label={`${formatMessage(messages.faculty)}${mode === 'profile' ? '*' : ''}`}
                    />

                    <Field
                      name="studyProgram"
                      type="text"
                      component={this.renderInput}
                      label={
                        `${formatMessage(messages.studyProgram)}${mode === 'profile' ? '*' : ''}`
                      }
                    />

                    <Field
                      name="studyYear"
                      type="text"
                      component={this.renderInput}
                      label={`${formatMessage(messages.studyYear)}${mode === 'profile' ? '*' : ''}`}
                    />

                    {mode !== 'profile' ?
                      <div>
                        <Field
                          name="state"
                          component={this.renderSelect}
                          label={`${formatMessage(messages.userState)}`}
                        >
                          {userStates ? Object.keys(userStates).map((key) =>
                            <option value={userStates[key]} key={key}>
                              {formatMessage(messages[`${userStates[key]}UserState`])}
                            </option>
                          ) : ''}
                        </Field>
                      </div>
                      : ''
                    }

                    {roles.includes(rolesList.get('NEXTERIA_TEAM').id) ?
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
                        <Field
                          name="newPassword"
                          type="password"
                          component={this.renderInput}
                          label={`${formatMessage(messages.newPassword)}`}
                        />

                        <Field
                          name="confirmationPassword"
                          type="password"
                          component={this.renderInput}
                          label={`${formatMessage(messages.confirmationPassword)}`}
                        />
                      </div>
                      : ''
                    }

                    {(fields.id.value && hasPermission('update_users')) ||
                     (!fields.id.value && hasPermission('create_users')) ||
                      mode === 'profile' ?
                      <div className="form-group">
                        <div className="col-sm-offset-2 col-sm-10">
                          <button
                            type="submit"
                            disabled={pristine || submitting}
                            className="btn btn-success"
                          >
                            <FormattedMessage {...messages.save} />
                          </button>
                        </div>
                      </div>
                      : ''
                    }
                  </form>
                </Tab>
                {mode === 'profile' ?
                  <Tab eventKey={2} title={formatMessage(messages.password)}>
                    <PasswordChange />
                  </Tab>
                :
                  ''
                }
              </Tabs>
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
    'tuitionFeeVariableSymbol',
    'lectorDescription',
    'guideDescription',
    'buddyDescription',
    'nexteriaTeamRole',
    'state',
    'newPassword',
    'oldPassword',
    'confirmationPassword',
    'hobby',
    'otherActivities'
  ],
});

EditUser = reduxForm({
  form: 'editUser',
  validate,
  asyncValidate,
  asyncBlurFields: ['username', 'email'],
})(EditUser);

EditUser = injectIntl(EditUser);
const selector = formValueSelector('editUser');

export default connect((state) => ({
  userStates: state.app.constants.states,
  rolesList: state.users.rolesList,
  roles: selector(state, 'roles'),
  users: state.users.users,
  locale: state.intl.currentLocale,
  hasPermission: (permission) => state.users.hasPermission(permission, state),
}), { ...fieldsActions, ...actions })(EditUser);
