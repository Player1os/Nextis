import { Record, List } from 'immutable';
import RichTextEditor from 'react-rte';

const User = Record({
  id: null,
  firstName: '',
  username: '',
  lastName: '',
  email: '',
  phone: '',
  tuitionFeeVariableSymbol: '',
  iban: '',
  facebookLink: '',
  linkedinLink: '',
  personalDescription: RichTextEditor.createEmptyValue(),
  photo: '',
  actualJobInfo: '',
  school: '',
  faculty: '',
  studyProgram: '',
  studyYear: '',
  studentLevelId: null,
  roles: new List(),
  activityPoints: '',
  tuitionDebt: '',
  guideDescription: RichTextEditor.createEmptyValue(),
  lectorDescription: RichTextEditor.createEmptyValue(),
  buddyDescription: RichTextEditor.createEmptyValue(),
  state: 'inactive',
  nexteriaTeamRole: '',
  created_at: null,
  updated_at: null,
  newPassword: '',
  oldPassword: '',
  payments: null,
  hostedEvents: null,
  confirmationPassword: '',
  confirmedPrivacyPolicy: false,
  confirmedMarketingUse: false,
  accountBalance: 0,
  gainedActivityPoints: 0,
  minimumSemesterActivityPoints: 0,
  activityPointsBaseNumber: 0,
  potentialActivityPoints: 0,
});

export default User;
