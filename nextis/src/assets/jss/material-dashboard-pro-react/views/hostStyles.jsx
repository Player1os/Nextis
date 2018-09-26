// ##############################
// // // ExtendedTables view styles
// #############################

import buttonGroupStyle from 'assets/jss/material-dashboard-pro-react/buttonGroupStyle';
import { primaryColor } from 'assets/jss/material-dashboard-pro-react';

const hostStyles = theme => ({
  right: {
    textAlign: 'right'
  },
  center: {
    textAlign: 'center'
  },
  description: {
    maxWidth: '150px'
  },
  actionButton: {
    margin: '0 0 0 5px',
    padding: '5px'
  },
  icon: {
    verticalAlign: 'middle',
    width: '17px',
    height: '17px',
    top: '-1px',
    position: 'relative'
  },
  checked: {
    color: primaryColor
  },
  checkedIcon: {
    width: '20px',
    height: '20px',
    border: '1px solid rgba(0, 0, 0, .54)',
    borderRadius: '3px'
  },
  uncheckedIcon: {
    width: '0px',
    height: '0px',
    padding: '9px',
    border: '1px solid rgba(0, 0, 0, .54)',
    borderRadius: '3px'
  },
  ...buttonGroupStyle,
  imgContainer: {
    width: '120px',
    maxHeight: '160px',
    overflow: 'hidden',
    display: 'block'
  },
  img: {
    width: '100%',
    height: 'auto',
    verticalAlign: 'middle',
    border: '0'
  },
  tdName: {
    minWidth: '200px',
    fontWeight: '400',
    fontSize: '1.5em'
  },
  tdNameAnchor: {
    color: '#3C4858'
  },
  tdNameSmall: {
    color: '#999999',
    fontSize: '0.75em',
    fontWeight: '300'
  },
  tdNumber: {
    textAlign: 'right',
    minWidth: '145px',
    fontWeight: '300',
    fontSize: '1.3em !important'
  },
  tdNumberSmall: {
    marginRight: '3px'
  },
  tdNumberAndButtonGroup: {
    lineHeight: '1 !important'
  },
  positionAbsolute: {
    position: 'absolute',
    right: '0',
    top: '0',
  },
  customFont: {
    fontSize: '16px !important'
  },
  actionButtonRound: {
    width: 'auto',
    height: 'auto',
    minWidth: 'auto'
  },
  actionButtons: {
    minWidth: '17em',
  },
  durationField: {
    minWidth: '9em',
  },
  positiveTermRow: {
  },
  warningTermRow: {
    backgroundColor: '#ff98008c',
  },
  emergencyTermRow: {
    backgroundColor: '#f443367a',
  },
  positiveDeadline: {

  },
  warningDeadline: {
    fontWeight: 400,
  },
  emergencyDeadline: {
    fontWeight: 'bold',
  },
  deadlineIcon: {
    fill: '#3a3a3a',
    position: 'relative',
    top: '5px',
    left: '10px',
  },
  eventTypeIcon: {
    width: '0.6em',
    height: '0.6em',
  },
  eventTypeButton: {
    fontSize: '0.6em',
    padding: '5px',
    margin: 0,
  },
  centerMobile: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center'
    }
  },
  legendButton: {
    marginRight: '1em',
  },
});

export default hostStyles;
