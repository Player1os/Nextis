import React from "react";
import cx from "classnames";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";

// material-ui components
import withStyles from "@material-ui/core/styles/withStyles";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";

// core components
import GridContainer from "components/Grid/GridContainer.jsx";
import ItemGrid from "components/Grid/ItemGrid.jsx";

import navPillsStyle from "assets/jss/material-dashboard-pro-react/components/navPillsStyle.jsx";

class NavPills extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: props.active
    };
  }
  handleChange = (event, active) => {
    this.setState({ active });
  };
  handleChangeIndex = index => {
    this.setState({ active: index });
  };
  render() {
    const {
      classes,
      tabs,
      color,
      horizontal,
      alignCenter
    } = this.props;
    const flexContainerClasses =
      classes.flexContainer +
      " " +
      cx({
        [classes.horizontalDisplay]: horizontal !== undefined
      });
    const tabButtons = (
      <Tabs
        classes={{
          root: classes.root,
          fixed: classes.fixed,
          flexContainer: flexContainerClasses,
          indicator: classes.displayNone,
        }}
        value={this.state.active}
        onChange={this.handleChange}
        centered={alignCenter}
      >
        {tabs.map((prop, key) => {
          var icon = {};
          if (prop.tabIcon !== undefined) {
            icon["icon"] = (
              <div>
                <prop.tabIcon className={classes.tabIcon} />
                {prop.badgeBottomLeft !== null ?
                  <div className={classes.badgeBottomLeft}>{prop.badgeBottomLeft}</div> : null
                }
                {prop.badgeBottomRight !== null ?
                  <div className={classes.badgeBottomRight}>{prop.badgeBottomRight}</div> : null
                }
                {prop.badgeTopLeft !== null ?
                  <div className={classes.badgeTopLeft}>{prop.badgeTopLeft}</div> : null
                }
                {prop.badgeTopRight !== null ?
                  <div className={classes.badgeTopRight}>{prop.badgeTopRight}</div> : null
                }
              </div>
            );
          }
          const pillsClasses =
            classes.pills +
            " " +
            cx({
              [classes.horizontalPills]: horizontal !== undefined,
              [classes.pillsWithIcons]: prop.tabIcon !== undefined
            });
          return (
            <Tab
              label={
                <div className={classes.tabButtonTitle}>
                  <div>{prop.tabButtonTitle}</div>
                  <div>{prop.tabButtonSubtitle}</div>
                </div>
              }
              key={key}
              {...icon}
              classes={{
                root: pillsClasses,
                labelContainer: classes.labelContainer,
                label: classes.label,
                textColorInheritSelected: classes[color]
              }}
            />
          );
        })}
      </Tabs>
    );
    const tabContent = (
      <div className={classes.contentWrapper}>
        <SwipeableViews
          axis={"x"}
          index={this.state.active}
          onChangeIndex={this.handleChangeIndex}
        >
          {tabs.map((prop, key) => {
            let addedClass = "";
            if (key !== this.state.active) {
              addedClass = classes.displayNone;
            }

            return (
              <div className={classes.tabContent + " " + addedClass} key={key}>
                {prop.tabContent}
              </div>
            );
          })}
        </SwipeableViews>
      </div>
    );
    return horizontal !== undefined ? (
      <GridContainer>
        <ItemGrid {...horizontal.tabsGrid}>{tabButtons}</ItemGrid>
        <ItemGrid {...horizontal.contentGrid}>{tabContent}</ItemGrid>
      </GridContainer>
    ) : (
      <div>
        {tabButtons}
        {tabContent}
      </div>
    );
  }
}

NavPills.defaultProps = {
  active: 0,
  color: "primary"
};

NavPills.propTypes = {
  classes: PropTypes.object.isRequired,
  // index of the default active pill
  active: PropTypes.number,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      tabButtonTitle: PropTypes.string,
      tabButtonSubitle: PropTypes.string,
      tabIcon: PropTypes.func,
      tabContent: PropTypes.node
    })
  ).isRequired,
  color: PropTypes.oneOf([
    "primary",
    "warning",
    "danger",
    "success",
    "info",
    "rose"
  ]),
  direction: PropTypes.string,
  horizontal: PropTypes.shape({
    tabsGrid: PropTypes.object,
    contentGrid: PropTypes.object
  }),
  alignCenter: PropTypes.bool
};

export default withStyles(navPillsStyle)(NavPills);
