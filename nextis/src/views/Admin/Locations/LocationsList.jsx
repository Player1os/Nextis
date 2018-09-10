import React from 'react';

// material-ui components
import withStyles from 'material-ui/styles/withStyles';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'common/store';
import Spinner from 'react-spinkit';
import ReactTable from 'react-table';
import { Route, withRouter } from 'react-router-dom';

// @material-ui/icons
import AddIcon from '@material-ui/icons/AddCircleOutline';
import HomeIcon from '@material-ui/icons/Home';
import Edit from '@material-ui/icons/Edit';

// core components
import GridContainer from 'components/Grid/GridContainer';
import ItemGrid from 'components/Grid/ItemGrid';
import IconCard from 'components/Cards/IconCard';
import IconButton from 'components/CustomButtons/IconButton';
import Button from 'components/CustomButtons/Button';

const styles = {
  actionButton: {
    margin: '0 0 0 5px',
    padding: '5px'
  },
  actionButtonRound: {
    width: 'auto',
    height: 'auto',
    minWidth: 'auto'
  },
  icon: {
    verticalAlign: 'middle',
    width: '17px',
    height: '17px',
    top: '-1px',
    position: 'relative'
  },
  icons: {
    width: '17px',
    height: '17px',
    marginRight: '5px',
  },
};

class LocationsList extends React.Component {
  transformAddress(location) {
    return `${location.addressLine1}${location.addressLine2 ? `, ${location.addressLine2}` : ''}
    , ${location.city}, ${location.zipCode}, ${location.countryCode}`
  }

  render() {
    const { data, classes, history } = this.props;

    if (data.loading) {
      return <Spinner name="line-scale-pulse-out" />;
    }

    const { locations } = data;

    const tableData = locations
      .map(location => ({
        name: location.name,
        address: this.transformAddress(location),
        actions: (
          <div className="actions-right">
            {[
              { color: 'success', icon: Edit, actionCode: 'edit' }
            ].map(prop => (
              <IconButton color={prop.color} customClass={`${classes.actionButton} ${classes.actionButtonRound}`} key={prop.actionCode}>
                <prop.icon className={classes.icon} />
              </IconButton>
            ))}
          </div>
        )
      }));

    return (
      <GridContainer>
        <ItemGrid xs={12} justify="center" container>
          <Button size="xs" color="success" onClick={() => history.push('/admin/locations/new')}>
            <AddIcon className={classes.icons} />
            {' Nové miesto'}
          </Button>
        </ItemGrid>
        <ItemGrid xs={12}>
          <IconCard
            icon={HomeIcon}
            title=""
            iconColor="orange"
            content={(
              <ReactTable
                data={tableData}
                filterable
                columns={[
                  {
                    Header: 'Názov',
                    accessor: 'name',
                  },
                  {
                    Header: 'Adresa',
                    accessor: 'address'
                  },
                  {
                    Header: 'Akcie',
                    accessor: 'actions',
                    sortable: false,
                    filterable: false,
                  }
                ]}
                minRows={tableData.length}
                defaultPageSize={tableData.length}
                showPagination={false}
                className="-striped -highlight"
              />
            )}
          />
        </ItemGrid>

        <Route
          path="/admin/locations/new"
          exact
          component={null}
        />
        <Route
          path="/admin/locations/:locationId"
          exact
          component={null}
        />
      </GridContainer>
    );
  }
}

const locationsQuery = gql`
query FetchLocations {
  locations {
    id
    name
    addressLine1
    addressLine2
    city
    zipCode
    countryCode
  }
}
`;

export default compose(
  withRouter,
  connect(state => ({ user: state.user })),
  withStyles(styles),
  graphql(locationsQuery, {}),
)(LocationsList);
