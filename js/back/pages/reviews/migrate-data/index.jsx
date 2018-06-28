// @flow
import type { ComponentType } from 'react';
import type { InputProps } from './migrate-data';
import { connect } from 'react-redux';
import { migrateData, uploadYotpoCsv } from 'back/actions/creators';
import MigrateData from './migrate-data';

const actions = {
  onMigrate: migrateData,
  onUploadYotpo: uploadYotpoCsv
};

const connectRedux = connect(null, actions);
const ConnectedComponent: ComponentType<InputProps> = connectRedux(MigrateData);

export default ConnectedComponent;
