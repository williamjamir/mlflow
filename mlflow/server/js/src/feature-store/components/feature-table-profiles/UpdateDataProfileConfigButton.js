import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, useNotification } from '@databricks/design-system';
import _ from 'lodash';
import { PropTypes } from 'prop-types';
import { useIntl } from 'react-intl';
import {
  UpdateDataProfileConfigForm,
  GLOBAL_PROFILE_KEY,
  RefreshMode,
} from './UpdateDataProfileConfigForm';
import { FeatureTableProps } from './FeatureTableProfileProps';
import { Services } from '../../services';
import Utils from '../../../common/utils/Utils';

async function updateConfig({ formValues, featureTable }) {
  const { name } = featureTable;
  const {
    windowGranularity,
    includeGlobalProfile,
    features,
    shouldAutoRecompute = false,
  } = formValues;
  const window_granularities = [windowGranularity];
  if (windowGranularity !== GLOBAL_PROFILE_KEY && includeGlobalProfile) {
    window_granularities.push(GLOBAL_PROFILE_KEY);
  }

  const { monitoring_config } = await Services.updateMonitoringConfig({
    feature_table: name,
    refresh_mode: shouldAutoRecompute ? RefreshMode.AUTO_REFRESH : RefreshMode.MANUAL_REFRESH,
    window_granularities,
    features,
  });
  return monitoring_config;
}

export function UpdateDataProfileConfigButton({ featureTable, onConfigurationChange }) {
  const intl = useIntl();
  const [notificationAPI, notificationContextHolder] = useNotification();
  const [form] = Form.useForm();
  // Configs used for profiles
  const [monitorConfig, setMonitorConfig] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const onUpdateConfig = async (formValues) => {
    const updatedConfigs = await updateConfig({
      formValues,
      featureTable,
    });
    if (!_.isEqual(monitorConfig, updatedConfigs)) {
      setMonitorConfig(updatedConfigs);
      notificationAPI.open({
        type: 'success',
        message: intl.formatMessage({
          defaultMessage: 'Configuration saved',
          description: 'Toast message for successful updating of monitoring configs',
        }),
      });
      onConfigurationChange(true);
    }
  };

  const handleSubmit = () => {
    const formValues = form.getFieldsValue();
    onUpdateConfig(formValues);
    closeModal();
  };

  const getMonitorConfig = async (name) => {
    setIsLoading(true);
    try {
      const { monitoring_config } = await Services.getMonitoringConfig({ feature_table: name });
      setMonitorConfig(monitoring_config);
    } catch (e) {
      Utils.logErrorAndNotifyUser(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const { name } = featureTable;
    getMonitorConfig(name);
  }, [featureTable]);

  return (
    <>
      {notificationContextHolder}
      <Button onClick={showModal} loading={isLoading}>
        {intl.formatMessage({
          defaultMessage: 'Update config',
          description: 'Config button for data profiles on the feature table page',
        })}
      </Button>
      {!isLoading && (
        <Modal
          title={intl.formatMessage({
            defaultMessage: 'Data profile config',
            description: 'Data profile config update modal title',
          })}
          visible={isModalVisible}
          okText={intl.formatMessage({
            defaultMessage: 'Save configuration',
            description: 'Ok text for update data profile config modal',
          })}
          onOk={handleSubmit}
          cancelText={intl.formatMessage({
            defaultMessage: 'Cancel',
            description: 'Cancel text for update data profile config modal',
          })}
          onCancel={closeModal}
        >
          <UpdateDataProfileConfigForm
            form={form}
            config={monitorConfig}
            featureTable={featureTable}
          />
        </Modal>
      )}
    </>
  );
}
UpdateDataProfileConfigButton.propTypes = {
  featureTable: FeatureTableProps.isRequired,
  onConfigurationChange: PropTypes.func.isRequired,
};
