import React from 'react';
import { CreateModelModal } from './CreateModelModal';

export class CreateModelPage extends React.Component {
  render() {
    return <CreateModelModal navigateBackOnCancel modalVisible hideModal={() => {}} />;
  }
}
