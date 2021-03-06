import './App.scss';
import './toastr.scss';
import Component from 'react-pure-render/component';
import Helmet from 'react-helmet';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { locationShape } from 'react-router';
import 'react-progress-bar-plus/lib/progress-bar.css';
import ProgressBar from 'react-progress-bar-plus';

import * as appActions from '../../common/app/actions';
import * as usersActions from '../../common/users/actions';
import * as eventsActions from '../../common/events/actions';
import * as locationsActions from '../../common/nxLocations/actions';
import * as semestersActions from '../../common/semesters/actions';
import favicon from '../../common/app/favicon';
import start from '../../common/app/start';
import AppSidebar from './AppSidebar';
import Header from './Header';
import Footer from './Footer';
import PrivacyPolicyDialog from '../users/PrivacyPolicyDialog';

// v4-alpha.getbootstrap.com/getting-started/introduction/#starter-template
const bootstrap4Metas = [
  { charset: 'utf-8' },
  {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1, shrink-to-fit=no'
  },
  {
    'http-equiv': 'x-ua-compatible',
    content: 'ie=edge'
  }
];

class App extends Component {

  static propTypes = {
    children: PropTypes.object,
    currentLocale: PropTypes.string.isRequired,
    location: locationShape,
    viewer: PropTypes.object,
    users: PropTypes.object,
    loadViewer: PropTypes.func.isRequired,
    loadUserGroups: PropTypes.func.isRequired,
    loadRolesList: PropTypes.func.isRequired,
    loadStudentLevelsList: PropTypes.func.isRequired,
    loadEventList: PropTypes.func.isRequired,
    loadLocationsList: PropTypes.func.isRequired,
    loadConstants: PropTypes.func.isRequired,
    loading: PropTypes.number.isRequired,
    events: PropTypes.object,
    hasPermission: PropTypes.func.isRequired,
    rolesList: PropTypes.object,
    isMobileSidebarOpen: PropTypes.bool.isRequired,
    fetchSemesters: PropTypes.func.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
    rolesData: PropTypes.object,
  };

  componentWillMount() {
    const {
      loadViewer,
      currentLocale,
      loadLocationsList,
      loadEventList,
      loadRolesList,
      loadStudentLevelsList,
      loadUserGroups,
      loadConstants,
      fetchSemesters,
      toggleSidebar,
    } = this.props;

    loadViewer();
    loadUserGroups();
    loadRolesList();
    loadEventList({ status: 'all', semesterId: 'all' });
    loadStudentLevelsList();
    loadLocationsList();
    loadConstants();
    fetchSemesters();

    if (!this.isMobile()) {
      toggleSidebar();
    }
  }

  isMobile() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  }

  render() {
    const {
      children,
      isMobileSidebarOpen,
      loading,
      hasPermission,
      currentLocale,
      rolesList,
      rolesData,
      location,
      events,
      viewer,
      toggleSidebar,
    } = this.props;

    if (!viewer || !rolesList || events === null) {
      return <div></div>;
    }

    let toggleSidebarFunc = toggleSidebar;
    if (!this.isMobile()) {
      toggleSidebarFunc = () => {};
    }

    return (
      <div className={`${isMobileSidebarOpen ? 'sidebar-open' : 'sidebar-closed'} wrapper`}>
        {loading > 0 ?
          <ProgressBar className="loading-bar" percent={0} />
          : ''
        }
        <Helmet
          htmlAttributes={{ lang: currentLocale }}
          titleTemplate="%s - Nexteria IS"
          meta={[
            ...bootstrap4Metas,
            {
              name: 'description',
              content: 'Nexteria IT system'
            },
            ...favicon.meta
          ]}
          link={[
            ...favicon.link
          ]}
        />
        {/* Pass location to ensure header active links are updated. */}
        <Header {...{ viewer }} location={location} />
        <AppSidebar toggleSidebar={toggleSidebarFunc} {...{ events, viewer, rolesData, isMobileSidebarOpen, rolesList, hasPermission }} ref="main-footer" />
        <div className="content-wrapper">
          {children}
        </div>
        {viewer.confirmedPrivacyPolicy ?
          ''
        :
          <PrivacyPolicyDialog />
        }
        <Footer />
      </div>
    );
  }

}

App = start(App);

export default connect(state => ({
  currentLocale: state.intl.currentLocale,
  viewer: state.users.viewer,
  events: state.events.events,
  loading: state.app.loading,
  isMobileSidebarOpen: state.app.isMobileSidebarOpen,
  rolesList: state.users.rolesList,
  rolesData: state.users.viewerRolesData,
  hasPermission: (permission) => state.users.hasPermission(permission, state),
}), { ...appActions, ...usersActions, ...eventsActions, ...locationsActions, ...semestersActions })(App);
